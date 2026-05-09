////////////////////////////////// TILE DATA GENERATOR

const fileSys = require('fs'); // Core Node.js file system utilities
const path = require('path'); // For cross-platform path manipulation
const postgisClient = require('pg'); // PostgreSQL client, optimized for spatial data
const queryBuilder = require('./queryCreator'); // Module to construct database queries
const resultProcessor = require('./resultParser'); // Module to interpret database results
const boundaryCalc = require('./bboxCreator'); // Module to compute bounding boxes for tiles
const utilityHelpers = require('../utils/utils'); // General utility functions (dependency kept for other potential uses)

// Database connection string for the GIS database
const dbConnectionUri = 'postgresql://gisuser:gisuser@energia.deusto.es:5432/gis';

// --- Custom Logger for consistent output ---
const logger = {
    info: (message) => console.log(`[INFO] ${new Date().toISOString()} - ${message}`),
    warn: (message) => console.warn(`[WARN] ${new Date().toISOString()} - ${message}`),
    error: (message) => console.error(`[ERROR] ${new Date().toISOString()} - ${message}`),
    success: (message) => console.log(`[SUCCESS] ${new Date().toISOString()} - ${message}`),
};

// --- Helper for creating directories recursively (async version) ---
async function ensureDirectoryExists(targetPath) {
    try {
        await fileSys.promises.mkdir(targetPath, { recursive: true });
        return true;
    } catch (e) {
        if (e.code === 'EEXIST') { // Directory already exists, which is fine
            return true;
        }
        logger.error(`Failed to create directory ${targetPath}: ${e.message}`);
        return false;
    }
}

////////////////////////////////// ESTABLISH DATABASE CONNECTION

// Establishes a connection to the PostgreSQL database using a connection pool.
// The pool manages client connections efficiently, improving performance.
module.exports.establishDbConnection = function establishDbConnection(completionHandler) {
    const dbPool = new postgisClient.Pool({ connectionString: dbConnectionUri });

    dbPool.on('error', (operationError, dbClient) => {
        logger.error(`Unexpected error on idle PostgreSQL client: ${operationError.message}`);
        // This is a critical error for the pool; a restart might be necessary.
    });

    // Attempt to acquire a client from the pool to test the connection.
    dbPool.connect((operationError, dbClient, releaseClient) => {
        if (operationError) {
            logger.error(`Database connection failed: ${operationError.message}`);
            completionHandler(operationError);
        } else {
            logger.success('Successfully connected to the spatial database via connection pool.');
            releaseClient(); // Release the client back to the pool immediately after testing.
            completionHandler(null, dbPool); // Pass the pool object for subsequent operations.
        }
    });
};

////////////////////////////////// TERMINATE DATABASE CONNECTION

// Terminates the database connection pool, releasing all resources.
module.exports.terminateDbConnection = function terminateDbConnection(dbPool, completionHandler) {
    if (!dbPool || typeof dbPool.end !== 'function') {
        logger.warn('Attempted to terminate a non-existent or invalid database pool object.');
        return completionHandler(new Error('Invalid DB pool provided for termination.'));
    }
    dbPool.end((operationError) => {
        if (operationError) {
            logger.error(`Error during database pool termination: ${operationError.message}`);
            completionHandler(operationError);
        } else {
            logger.success('Database connection pool terminated successfully.');
            completionHandler();
        }
    });
};

////////////////////////////////// GENERATE A SINGLE TILE

// Creates and saves a single map tile (JSON data) for a given Z/X/Y coordinate.
async function createSingleMapTile(dbPool, zoomLevel, xCoord, yCoord, completionHandler) {
    logger.info(`Initiating generation for tile: Z${zoomLevel}/X${xCoord}/Y${yCoord}`);

    // Robust input validation for tile coordinates
    if (typeof zoomLevel !== 'number' || zoomLevel < 0 || !Number.isInteger(zoomLevel) ||
        typeof xCoord !== 'number' || xCoord < 0 || !Number.isInteger(xCoord) ||
        typeof yCoord !== 'number' || yCoord < 0 || !Number.isInteger(yCoord)) {
        const validationError = new Error('Invalid tile coordinates provided. All must be non-negative integers.');
        logger.error(`Validation failed for tile Z${zoomLevel}/X${xCoord}/Y${yCoord}: ${validationError.message}`);
        return completionHandler(validationError);
    }

    // Determine the geographic bounding box for the tile.
    boundaryCalc.getLTRBbox(zoomLevel, xCoord, yCoord, async (leftBound, topBound, rightBound, bottomBound) => {
        // Explicit check for valid bounding box coordinates
        if (leftBound === undefined || topBound === undefined || rightBound === undefined || bottomBound === undefined ||
            isNaN(leftBound) || isNaN(topBound) || isNaN(rightBound) || isNaN(bottomBound)) {
            const bboxError = new Error(`Failed to calculate valid bounding box for tile Z${zoomLevel}/X${xCoord}/Y${yCoord}.`);
            logger.error(bboxError.message);
            return completionHandler(bboxError);
        }

        const tileOutputPath = path.join('public', 'tiles', String(zoomLevel), String(xCoord), String(yCoord) + '.json');

        // Ensure the output directory structure exists before writing the file.
        const dirCreationSuccess = await ensureDirectoryExists(path.dirname(tileOutputPath));
        if (!dirCreationSuccess) {
            return completionHandler(new Error(`Could not ensure directory exists for ${tileOutputPath}.`));
        }

        // Acquire a client from the pool for the database query.
        dbPool.connect((acquireError, dbClient, releaseClient) => {
            if (acquireError) {
                logger.error(`Failed to acquire DB client for tile Z${zoomLevel}/X${xCoord}/Y${yCoord}: ${acquireError.message}`);
                return completionHandler(acquireError);
            }

            const sqlQuery = queryBuilder.getQuery(zoomLevel, leftBound, topBound, rightBound, bottomBound);

            dbClient.query(sqlQuery, (queryOperationError, queryResult) => {
                releaseClient(); // Release the client back to the pool immediately after query.

                if (queryOperationError) {
                    logger.error(`Database query failed for tile ${tileOutputPath}: ${queryOperationError.message}`);
                    return completionHandler(queryOperationError);
                }

                if (!queryResult || !queryResult.rows || queryResult.rows.length === 0) {
                    logger.warn(`No data rows returned for tile ${tileOutputPath}. Skipping file creation.`);
                    // Still consider this a success for tile generation, just empty data.
                    return completionHandler(null);
                }

                resultProcessor.parseResult(queryResult, (processedData) => {
                    if (!processedData) {
                        logger.warn(`Parsing returned no meaningful data for tile ${tileOutputPath}.`);
                        return completionHandler(null); // Treat as success, empty data
                    }

                    // Write the processed data to the JSON file.
                    fileSys.writeFile(tileOutputPath, JSON.stringify(processedData, null, 2), (writeError) => {
                        if (writeError) {
                            logger.error(`Error writing tile data to ${tileOutputPath}: ${writeError.message}`);
                            completionHandler(writeError);
                        } else {
                            logger.success(`Successfully generated tile data for ${tileOutputPath}.`);
                            completionHandler(null);
                        }
                    });
                });
            });
        });
    });
}
module.exports.createSingleMapTile = createSingleMapTile;

////////////////////////////////// GENERATE TILES FOR A SPECIFIC ZOOM LEVEL REGION

// Generates all tiles within a specified rectangular region (minX, minY to maxX, maxY)
// for a particular zoom level. This function processes tiles sequentially to manage load.
function generateZoomLevelTilesInRegion(dbPool, zoomLevel, minXTile, minYTile, maxXTile, maxYTile, completionHandler) {
    logger.info(`Starting generation for zoom level ${zoomLevel} tiles from X${minXTile}-Y${minYTile} to X${maxXTile}-Y${maxYTile}.`);

    // Validate input coordinates
    if (typeof zoomLevel !== 'number' || zoomLevel < 0 || !Number.isInteger(zoomLevel) ||
        typeof minXTile !== 'number' || minXTile < 0 || !Number.isInteger(minXTile) ||
        typeof minYTile !== 'number' || minYTile < 0 || !Number.isInteger(minYTile) ||
        typeof maxXTile !== 'number' || maxXTile < minXTile || !Number.isInteger(maxXTile) ||
        typeof maxYTile !== 'number' || maxYTile < minYTile || !Number.isInteger(maxYTile)) {
        const validationError = new Error('Invalid input range for tile generation. Check zoom, min/max X/Y, and integer types.');
        logger.error(`Validation failed for zoom region: ${validationError.message}`);
        return completionHandler(validationError);
    }

    const tileTasks = [];
    for (let x = minXTile; x <= maxXTile; x++) {
        for (let y = minYTile; y <= maxYTile; y++) {
            tileTasks.push({ zoomLevel, xCoord: x, yCoord: y });
        }
    }

    if (tileTasks.length === 0) {
        logger.warn(`No tiles to generate for zoom level ${zoomLevel} within the specified region.`);
        return completionHandler(null);
    }

    let completedTasks = 0;
    let errorsEncountered = [];
    const totalTilesToProcess = tileTasks.length;

    const processNextTile = () => {
        if (tileTasks.length === 0) {
            // All tasks have been queued. Now wait for all callbacks to finish.
            if (completedTasks === totalTilesToProcess) {
                if (errorsEncountered.length > 0) {
                    logger.error(`Completed generation for zoom level ${zoomLevel} with ${errorsEncountered.length} errors.`);
                    return completionHandler(new Error(`Multiple errors during tile generation: ${errorsEncountered.map(e => e.message).join('; ')}`));
                } else {
                    logger.success(`Successfully generated all tiles for zoom level ${zoomLevel} within the specified region.`);
                    return completionHandler(null);
                }
            }
            return; // Still waiting for some async calls to complete
        }

        const task = tileTasks.shift(); // Get the next task from the queue

        createSingleMapTile(dbPool, task.zoomLevel, task.xCoord, task.yCoord, (operationError) => {
            completedTasks++;
            if (operationError) {
                errorsEncountered.push(operationError);
                logger.error(`Error generating tile Z${task.zoomLevel}/X${task.xCoord}/Y${task.yCoord}: ${operationError.message}`);
            }
            // Recursively call to process the next tile, ensuring sequential execution.
            processNextTile();
        });
    };

    // Start processing the tiles by initiating the first call.
    processNextTile();
}
module.exports.generateZoomLevelTilesInRegion = generateZoomLevelTilesInRegion;


////////////////////////////////// GENERATE TILES FOR A GEOGRAPHIC BOUNDING BOX

// Generates tiles covering a specific geographic bounding box for a given zoom level.
function createTilesForGeographicBox(dbPool, zoomLevel, geoLeft, geoTop, geoRight, geoBottom, completionHandler) {
    logger.info(`Request to generate tiles for geographic box [${geoLeft},${geoTop},${geoRight},${geoBottom}] at zoom ${zoomLevel}.`);

    // Add input validation for geographic coordinates
    if (typeof zoomLevel !== 'number' || zoomLevel < 0 || !Number.isInteger(zoomLevel) ||
        typeof geoLeft !== 'number' || typeof geoTop !== 'number' ||
        typeof geoRight !== 'number' || typeof geoBottom !== 'number' ||
        isNaN(geoLeft) || isNaN(geoTop) || isNaN(geoRight) || isNaN(geoBottom) ||
        geoLeft > geoRight || geoBottom > geoTop) { // Assuming top is greater than bottom for typical lat/lon
        const validationError = new Error('Invalid geographic coordinates or zoom level provided. Check types and ranges.');
        logger.error(`Validation failed for geographic box: ${validationError.message}`);
        return completionHandler(validationError);
    }

    boundaryCalc.getXYbox(zoomLevel, geoLeft, geoTop, geoRight, geoBottom, (calculatedZoom, minXTile, minYTile, maxXTile, maxYTile) => {
        // Check if valid tile coordinates were returned.
        if (minXTile === undefined || minYTile === undefined || maxXTile === undefined || maxYTile === undefined ||
            isNaN(minXTile) || isNaN(minYTile) || isNaN(maxXTile) || isNaN(maxYTile)) {
            logger.warn(`Could not determine valid tile range for geographic box at zoom ${zoomLevel}. Skipping.`);
            return completionHandler(null); // No error, just nothing to generate.
        }

        // Guard clause: If the calculated tile range is invalid (e.g., max < min)
        if (maxXTile < minXTile || maxYTile < minYTile) {
            logger.warn(`Calculated tile range is inverted or empty for zoom ${zoomLevel}. Skipping tile generation.`);
            return completionHandler(null);
        }

        generateZoomLevelTilesInRegion(dbPool, zoomLevel, minXTile, minYTile, maxXTile, maxYTile, (generationError) => {
            if (generationError) {
                logger.error(`Failed to generate tiles for geographic box at zoom ${zoomLevel}: ${generationError.message}`);
                completionHandler(generationError);
            } else {
                logger.success(`Completed tile generation for geographic box at zoom ${zoomLevel}.`);
                completionHandler(null);
            }
        });
    });
}
module.exports.createTilesForGeographicBox = createTilesForGeographicBox;


////////////////////////////////// GENERATE ALL TILES FOR A SPECIFIED ZOOM RANGE

// Generates all tiles for a range of zoom levels, covering the entire world at each level.
// This function processes zoom levels sequentially.
function produceTilesForZoomRange(dbPool, startZoom, endZoom, completionHandler) {
    logger.info(`Initiating tile production for zoom levels from ${startZoom} to ${endZoom}.`);

    // Input validation for zoom range
    if (typeof startZoom !== 'number' || startZoom < 0 || !Number.isInteger(startZoom) ||
        typeof endZoom !== 'number' || endZoom < startZoom || !Number.isInteger(endZoom)) {
        const validationError = new Error('Invalid zoom level range provided. Must be non-negative integers and start <= end.');
        logger.error(`Validation failed for zoom range: ${validationError.message}`);
        return completionHandler(validationError);
    }

    const zoomLevelsToProcess = [];
    for (let z = startZoom; z <= endZoom; z++) {
        zoomLevelsToProcess.push(z);
    }

    if (zoomLevelsToProcess.length === 0) {
        logger.warn('No zoom levels to process in the specified range.');
        return completionHandler(null);
    }

    let completedZoomLevels = 0;
    let errorsAcrossZooms = [];
    const totalZoomLevels = zoomLevelsToProcess.length;

    // Process zoom levels sequentially to manage resource usage and provide clearer logging.
    const processNextZoomLevel = () => {
        if (zoomLevelsToProcess.length === 0) {
            // All zoom levels have been queued. Now wait for all callbacks to finish.
            if (completedZoomLevels === totalZoomLevels) {
                if (errorsAcrossZooms.length > 0) {
                    logger.error(`Completed tile production for zoom range with ${errorsAcrossZooms.length} zoom level errors.`);
                    return completionHandler(new Error(`Multiple errors during zoom range generation: ${errorsAcrossZooms.map(e => e.message).join('; ')}`));
                } else {
                    logger.success(`Successfully completed tile production for zoom levels ${startZoom} to ${endZoom}.`);
                    return completionHandler(null);
                }
            }
            return; // Still waiting for some async calls to complete
        }

        const currentZoom = zoomLevelsToProcess.shift(); // Get the next zoom level to process.
        const tilesAtZoomLevel = Math.pow(2, currentZoom);

        // Ensure the zoom-specific directory exists.
        ensureDirectoryExists(path.join('public', 'tiles', String(currentZoom)))
            .then(dirSuccess => {
                if (!dirSuccess) {
                    const dirError = new Error(`Failed to ensure directory for zoom ${currentZoom}.`);
                    errorsAcrossZooms.push(dirError);
                    logger.error(dirError.message);
                    completedZoomLevels++;
                    return processNextZoomLevel(); // Continue to next zoom level
                }

                logger.info(`Starting full world generation for zoom level ${currentZoom}.`);
                generateZoomLevelTilesInRegion(dbPool, currentZoom, 0, 0, tilesAtZoomLevel - 1, tilesAtZoomLevel - 1, (zoomGenerationError) => {
                    completedZoomLevels++;
                    if (zoomGenerationError) {
                        errorsAcrossZooms.push(zoomGenerationError);
                        logger.error(`Error generating all tiles for zoom level ${currentZoom}: ${zoomGenerationError.message}`);
                    } else {
                        logger.success(`Finished full world generation for zoom level ${currentZoom}.`);
                    }
                    processNextZoomLevel(); // Process the next zoom level or conclude.
                });
            })
            .catch(err => {
                const asyncDirError = new Error(`Unexpected error ensuring directory for zoom ${currentZoom}: ${err.message}`);
                errorsAcrossZooms.push(asyncDirError);
                logger.error(asyncDirError.message);
                completedZoomLevels++;
                processNextZoomLevel(); // Continue to next zoom level
            });
    };

    // Start processing from the first zoom level.
    processNextZoomLevel();
}
module.exports.produceTilesForZoomRange = produceTilesForZoomRange;