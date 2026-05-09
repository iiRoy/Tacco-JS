const fileSystemOps = require('fs');
const databaseConnector = require('pg');
const sqlQueryBuilder = require('./queryCreator');
const dataProcessor = require('./resultParser');
const geographicCalculator = require('./bboxCreator');
const auxiliaryTools = require('../utils/utils');

const connectionDetails = 'tcp://gisuser:gisuser@energia.deusto.es:5432/gis';

const makePromise = (fn, ...args) => {
    return new Promise((res, rej) => {
        if (fn.name === 'getLTRBbox' || fn.name === 'getXYbox') {
             fn(...args, (arg1, arg2, arg3, arg4) => {
                if (!arg1 && !arg2 && !arg3 && !arg4) {
                    rej(new Error('Invalid geographic bounds detected.'));
                } else {
                    res({ p1: arg1, p2: arg2, p3: arg3, p4: arg4 });
                }
            });
        } else if (fn.name === 'query') {
            fn(...args, (err, result) => {
                if (err) rej(err);
                else res(result);
            });
        } else if (fn.name === 'parseResult') {
            fn(...args, (parsedData) => {
                if (parsedData === undefined || parsedData === null) rej(new Error('Data parsing yielded no result.'));
                else res(parsedData);
            });
        } else if (fn.name === 'fileExists') {
            fn(...args, (exists, stream, file) => {
                res({ exists, stream, file });
            });
        } else if (fn.name === 'dirExists') {
             fn(...args, (result, temp, dir) => {
                 res({ result, temp, dir });
             });
        } else {
            fn(...args, (err, ...results) => {
                if (err) return rej(err);
                if (results.length === 1) return res(results[0]);
                if (results.length === 0) return res();
                return res(results);
            });
        }
    });
};

const tileProducer = {};

////////////////////////////////// ESTABLISH DB CONNECTION

tileProducer.establishConnection = async () => {
    const dataClient = new databaseConnector.Client(connectionDetails);
    try {
        await makePromise(dataClient.connect.bind(dataClient));
        return dataClient;
    } catch (err) {
        throw new Error(`Database connection failed: ${err.message}`);
    }
};

////////////////////////////////// TERMINATE DB CONNECTION

tileProducer.terminateConnection = (dataClient) => {
    dataClient.end();
};

async function ensurePathExists(pathSegment, identifier, baseDir) {
    try {
        const { result, temp, dir } = await makePromise(auxiliaryTools.dirExists, baseDir + pathSegment, identifier, baseDir);
        if (!result) {
            await fileSystemOps.promises.mkdir(dir, { recursive: true });
        }
        return dir;
    } catch (err) {
        console.error(`Error ensuring directory path for ${pathSegment}: ${err.message}`);
        throw err;
    }
}

async function manageFileContent(filePath, contentStream) {
    try {
        const { exists, stream, file } = await makePromise(auxiliaryTools.fileExists, filePath, contentStream, filePath);
        if (exists) {
            await fileSystemOps.promises.unlink(file);
        }
        await fileSystemOps.promises.writeFile(file, stream);
        console.log(`Content successfully persisted to ${file}`);
    } catch (err) {
        console.error(`File operation failure for ${filePath}: ${err.message}`);
        throw err;
    }
}

////////////////////////////////// RENDER A SINGLE CELL

async function renderSingleCell(dataClient, zLevel, xCoord, yCoord) {
    console.log(`[GENERATOR] Processing cell ${zLevel}/${xCoord}/${yCoord}`);

    try {
        const { p1: leftBound, p2: topBound, p3: rightBound, p4: bottomBound } = await makePromise(geographicCalculator.getLTRBbox, zLevel, xCoord, yCoord);

        if (!leftBound && !topBound && !rightBound && !bottomBound) {
            console.warn(`[GENERATOR] Bounding box invalid for ${zLevel}/${xCoord}/${yCoord}. Skipping cell.`);
            return;
        }

        const spatialQuery = sqlQueryBuilder.getQuery(zLevel, leftBound, topBound, rightBound, bottomBound);
        const queryResult = await makePromise(dataClient.query.bind(dataClient), spatialQuery);

        const targetFilePath = `public/tiles/${zLevel}/${xCoord}/${yCoord}.json`;
        const processedData = await makePromise(dataProcessor.parseResult, queryResult);

        if (processedData) {
            await manageFileContent(targetFilePath, processedData);
            console.log(`[GENERATOR] Cell ${targetFilePath} successfully generated.`);
        } else {
            console.error(`[GENERATOR] No data processed for ${targetFilePath}.`);
        }
    } catch (err) {
        console.error(`[GENERATOR] Error during cell processing ${zLevel}/${xCoord}/${yCoord}: ${err.message}`);
        throw err;
    }
}
tileProducer.renderSingleCell = renderSingleCell;

////////////////////////////////// PROCESS A ZOOM REGION

async function processZoomRegion(dataClient, zoomLevel, startX, startY, endX, endY) {
    console.log(`[GENERATOR] Initiating region processing for zoom ${zoomLevel} from (${startX},${startY}) to (${endX},${endY})`);

    await ensurePathExists(`${zoomLevel}`, zoomLevel, 'public/tiles/');

    const cellTasks = [];

    for (let currentX = startX; currentX <= endX; currentX++) {
        await ensurePathExists(`${zoomLevel}/${currentX}`, currentX, 'public/tiles/');
        for (let currentY = startY; currentY <= endY; currentY++) {
            cellTasks.push(renderSingleCell(dataClient, zoomLevel, currentX, currentY));
        }
    }

    try {
        await Promise.allSettled(cellTasks);
        console.log(`[GENERATOR] Completed region processing for zoom ${zoomLevel}.`);
    } catch (err) {
        console.error(`[GENERATOR] An issue occurred during region processing for zoom ${zoomLevel}: ${err.message}`);
        throw err;
    }
}
tileProducer.processZoomRegion = processZoomRegion;

////////////////////////////////// RENDER GEOGRAPHIC AREA TILES

async function renderGeographicAreaTiles(dataClient, zoomLevel, geoLeft, geoTop, geoRight, geoBottom) {
    console.log(`[GENERATOR] Deriving tile coordinates for geographic area at zoom ${zoomLevel}`);

    try {
        const { p1: minXCoord, p2: minYCoord, p3: maxXCoord, p4: maxYCoord } = await makePromise(geographicCalculator.getXYbox, zoomLevel, geoLeft, geoTop, geoRight, geoBottom);

        if (!minXCoord && !minYCoord && !maxXCoord && !maxYCoord) {
            console.log(`[GENERATOR] No valid tile coordinate range found for geographic area at zoom ${zoomLevel}. Aborting.`);
            return;
        }

        await processZoomRegion(dataClient, zoomLevel, minXCoord, minYCoord, maxXCoord, maxYCoord);
        console.log(`[GENERATOR] Geographic area tiles rendered for zoom ${zoomLevel}.`);
    } catch (err) {
        console.error(`[GENERATOR] Error rendering geographic area tiles at zoom ${zoomLevel}: ${err.message}`);
        throw err;
    }
}
tileProducer.renderGeographicAreaTiles = renderGeographicAreaTiles;

////////////////////////////////// PRODUCE ALL TILES FOR SPECIFIED ZOOM LEVELS

async function produceZoomLevels(dataClient, startZoom, endZoom) {
    console.log(`[GENERATOR] Commencing tile production for zoom levels from ${startZoom} to ${endZoom}`);

    await ensurePathExists('', null, 'public/tiles/');

    const zoomLevelTasks = [];
    for (let currentZoom = startZoom; currentZoom <= endZoom; currentZoom++) {
        zoomLevelTasks.push(async () => {
            const totalCells = Math.pow(2, currentZoom);
            await processZoomRegion(dataClient, currentZoom, 0, 0, totalCells - 1, totalCells - 1);
            console.log(`[GENERATOR] All cells for zoom level ${currentZoom} completed.`);
        });
    }

    for (const task of zoomLevelTasks) {
        await task();
    }

    console.log(`[GENERATOR] All requested zoom levels from ${startZoom} to ${endZoom} have been processed.`);
}
tileProducer.produceZoomLevels = produceZoomLevels;

module.exports = tileProducer;