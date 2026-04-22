// This module provides a set of refined utilities for handling geospatial data
// stored within a Redis instance, primarily leveraging sorted sets (ZSETs)
// with geohash integer encoding for location representation.

const coordinateTransformer = require('ngeohash'); // Renamed the geohash dependency

/**
 * Ensures a callback function is invoked safely, handling cases where it might not be provided.
 * @param {Function|undefined} handler - The callback function to execute.
 * @param {Error|null} operationError - An error object, if the operation failed.
 * @param {*} operationResult - The data result from the operation.
 */
function safelyInvokeCompletion(handler, operationError, operationResult) {
    if (typeof handler === 'function') {
        handler(operationError, operationResult);
    } else if (operationError) {
        // As a fallback, log the error if no handler is available to catch it.
        console.error("Asynchronous task completed with an error, but no callback was provided to handle it:", operationError);
    }
}

/**
 * Decodes a raw geohash score and associates it with a given identifier.
 * This function is robust against invalid or missing geohash values.
 * @param {string} entityIdentifier - A unique label for the geographical point.
 * @param {string|null|undefined} geohashScore - The geohash integer value as a string from Redis ZSCORE.
 * @returns {object|null} An object containing the entity's ID, latitude, longitude, and the original score, or null if decoding fails.
 */
function processEncodedLocation(entityIdentifier, geohashScore) {
    // If no score is provided, the entity likely doesn't exist or has no geohash.
    if (geohashScore === null || geohashScore === undefined || geohashScore.trim() === '') {
        return null;
    }

    let decodedCoordinates;
    try {
        // The original `decode_int` expects an integer. ZSCORE returns a string, so parseInt is crucial.
        decodedCoordinates = coordinateTransformer.decode_int(parseInt(geohashScore, 10), 52);
    } catch (conversionError) {
        console.warn(`Failed to decode geohash for entity '${entityIdentifier}' with score '${geohashScore}': ${conversionError.message}`);
        return null; // Return null if the geohash score cannot be processed.
    }

    return {
        uniqueId: entityIdentifier,
        latitude: decodedCoordinates.latitude,
        longitude: decodedCoordinates.longitude,
        rawGeohashScore: geohashScore // Include the raw score for debugging/completeness
    };
}

/**
 * Fetches the geospatial coordinates for a single named entity from the Redis store.
 * @param {object} storeConfiguration - Contains `client` (Redis client) and `geoKey` (ZSET name).
 * @param {string} entityName - The name of the entity to look up.
 * @param {Function} responseHandler - Callback `(err, geoPointObject)`.
 */
function retrieveSingleGeoPoint(storeConfiguration, entityName, responseHandler) {
    // Basic validation for critical configuration elements.
    if (!storeConfiguration || !storeConfiguration.client || !storeConfiguration.geoKey) {
        return safelyInvokeCompletion(responseHandler, new Error("Invalid Redis store configuration provided."), null);
    }
    // Ensure the entity name is a valid string.
    if (typeof entityName !== 'string' || entityName.trim() === '') {
        return safelyInvokeCompletion(responseHandler, new Error("Entity name must be a non-empty string."), null);
    }

    storeConfiguration.client.zscore(storeConfiguration.geoKey, entityName, (lookupError, rawScoreReply) => {
        if (lookupError) {
            safelyInvokeCompletion(responseHandler, lookupError, null);
        } else {
            // Process the raw reply using the dedicated decoding function.
            const geographicalPoint = processEncodedLocation(entityName, rawScoreReply);
            safelyInvokeCompletion(responseHandler, null, geographicalPoint);
        }
    });
}

/**
 * Retrieves geospatial coordinates for multiple named entities in a batch operation.
 * @param {object} storeConfiguration - Contains `client` (Redis client) and `geoKey` (ZSET name).
 * @param {string[]} entityNameCollection - An array of entity names to retrieve.
 * @param {Function} responseHandler - Callback `(err, arrayOfGeoPointObjects)`.
 */
function retrieveBatchGeoPoints(storeConfiguration, entityNameCollection, responseHandler) {
    // Validate store configuration.
    if (!storeConfiguration || !storeConfiguration.client || !storeConfiguration.geoKey) {
        return safelyInvokeCompletion(responseHandler, new Error("Invalid Redis store configuration provided."), null);
    }
    // Validate the input array of entity names.
    if (!Array.isArray(entityNameCollection) || entityNameCollection.length === 0) {
        return safelyInvokeCompletion(responseHandler, new Error("Entity name collection must be a non-empty array."), null);
    }

    const redisTransaction = storeConfiguration.client.multi();

    // Queue up ZSCORE commands for each entity in the collection.
    entityNameCollection.forEach(name => {
        // Optional: More rigorous validation for each name can be added here.
        redisTransaction.zscore(storeConfiguration.geoKey, name);
    });

    redisTransaction.exec((transactionError, rawScoreReplies) => {
        if (transactionError) {
            safelyInvokeCompletion(responseHandler, transactionError, null);
        } else {
            // Map each raw score reply to a processed geographical point.
            // Filter out any points that could not be decoded (e.g., entity not found).
            const decodedPoints = rawScoreReplies
                .map((score, index) => processEncodedLocation(entityNameCollection[index], score))
                .filter(point => point !== null); // Remove null entries (failed decodes/not found)

            safelyInvokeCompletion(responseHandler, null, decodedPoints);
        }
    });
}

/**
 * Appends ZRANGEBYSCORE commands to a Redis MULTI pipeline based on specified score ranges.
 * @param {Array<Array<number>>} scoreIntervals - An array where each element is `[minScore, maxScore]`.
 * @param {string} targetZSetKey - The key of the Redis sorted set.
 * @param {object} pipelineHandle - The Redis MULTI transaction object.
 * @param {boolean} includeScoresInResult - If true, `WITHSCORES` will be added to the command.
 */
function populateRangePipeline(scoreIntervals, targetZSetKey, pipelineHandle, includeScoresInResult) {
    if (!Array.isArray(scoreIntervals) || scoreIntervals.length === 0) {
        return; // No intervals provided, nothing to add to pipeline.
    }

    scoreIntervals.forEach(interval => {
        if (!Array.isArray(interval) || interval.length < 2) {
            console.warn("Skipping malformed score interval:", interval);
            return; // Skip invalid interval definitions.
        }
        const [lowerBound, upperBound] = interval;
        if (includeScoresInResult) {
            pipelineHandle.ZRANGEBYSCORE(targetZSetKey, lowerBound, upperBound, 'WITHSCORES');
        } else {
            pipelineHandle.ZRANGEBYSCORE(targetZSetKey, lowerBound, upperBound);
        }
    });
}

/**
 * Consolidates multiple arrays of member names into a single flattened array.
 * This is used when ZRANGEBYSCORE is executed WITHOUT WITHSCORES.
 * @param {Array<Array<string>>} batchedMemberNames - An array of arrays, where each inner array contains member names.
 * @returns {Array<string>} A single array containing all unique member names.
 */
function aggregateSimpleRangeResults(batchedMemberNames) {
    // Using flatMap to efficiently flatten the array of arrays.
    // Handles cases where a batch might be null or empty.
    return batchedMemberNames.flatMap(batch => batch || []);
}

/**
 * Parses ZRANGEBYSCORE results that include scores (WITHSCORES option).
 * It extracts member names and decodes their geohash scores into latitude/longitude.
 * @param {Array<Array<string>>} scoredResultBatches - Array of arrays, where each inner array is `[member1, score1, member2, score2, ...]`.
 * @returns {Array<Array<string|number>>} An array of `[memberName, latitude, longitude]` arrays.
 */
function parseDetailedScoredResults(scoredResultBatches) {
    const fullyDecodedPoints = [];

    scoredResultBatches.forEach(batch => {
        if (!batch || batch.length === 0) return; // Skip empty or invalid batches.

        // Iterate through the batch, taking two elements at a time: member name and its score.
        for (let i = 0; i < batch.length; i += 2) {
            const memberName = batch[i];
            const memberScore = batch[i + 1]; // This is the geohash integer value as a string.

            let decodedCoordinates = null;
            try {
                decodedCoordinates = coordinateTransformer.decode_int(parseInt(memberScore, 10), 52);
            } catch (decodingError) {
                console.warn(`Failed to decode geohash for member '${memberName}' with score '${memberScore}': ${decodingError.message}`);
                continue; // Skip this specific entry if decoding fails.
            }

            fullyDecodedPoints.push([
                memberName,
                decodedCoordinates.latitude,
                decodedCoordinates.longitude
            ]);
        }
    });

    return fullyDecodedPoints;
}

/**
 * Executes a series of range queries on a Redis sorted set, useful for geographical bounding box searches.
 * @param {object} storeConfig - Configuration object with `client` and `geoKey`.
 * @param {Array<Array<number>>} scoreRangeDefinitions - An array of `[minScore, maxScore]` arrays.
 * @param {boolean} shouldIncludeCoordinates - If true, the output will include decoded latitude/longitude.
 * @param {Function} finalCallback - Callback `(err, results)`.
 */
function executeGeohashRangeQuery(storeConfig, scoreRangeDefinitions, shouldIncludeCoordinates, finalCallback) {
    // Comprehensive input validation for the query.
    if (!storeConfig || !storeConfig.client || !storeConfig.geoKey) {
        return safelyInvokeCompletion(finalCallback, new Error("Invalid Redis storage configuration provided for range query."), null);
    }
    if (!Array.isArray(scoreRangeDefinitions) || scoreRangeDefinitions.some(def => !Array.isArray(def) || def.length !== 2)) {
        return safelyInvokeCompletion(finalCallback, new Error("Score range definitions must be an array of [min, max] arrays."), null);
    }

    const redisTransactionPipe = storeConfig.client.multi();

    // Populate the transaction pipeline with ZRANGEBYSCORE commands.
    populateRangePipeline(scoreRangeDefinitions, storeConfig.geoKey, redisTransactionPipe, !!shouldIncludeCoordinates);

    redisTransactionPipe.exec((queryError, rawQueryResponses) => {
        if (queryError) {
            safelyInvokeCompletion(finalCallback, queryError, null);
        } else {
            let processedResults;
            if (!!shouldIncludeCoordinates) {
                processedResults = parseDetailedScoredResults(rawQueryResponses);
            } else {
                processedResults = aggregateSimpleRangeResults(rawQueryResponses);
            }
            safelyInvokeCompletion(finalCallback, null, processedResults);
        }
    });
}


// Export the public API functions of this module.
module.exports = {
    fetchSinglePointData: retrieveSingleGeoPoint,
    fetchPointsBatch: retrieveBatchGeoPoints,
    performGeospatialRangeSearch: executeGeohashRangeQuery
};