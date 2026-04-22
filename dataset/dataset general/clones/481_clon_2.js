const geoHashProcessor = require ('ngeohash'); // Import the geohash utility library

/**
 * Retrieves the geohash score for a specific named location from the data store.
 * @param {object} dataStore          - The Redis client and sorted set key container.
 * @param {string} placeIdentifier    - The unique name of the location to query.
 * @param {function} completionHandler - Callback function (error, result) for asynchronous operation completion.
 */
function findSinglePlace (dataStore, placeIdentifier, completionHandler) {

  // Execute a ZSCORE command on the Redis sorted set
  dataStore.redisClient.zscore(
    dataStore.sortedSetKey,
    placeIdentifier,
    function (errorObject, responseValue) {
      // Check if an error occurred during the Redis operation
      if (errorObject) {
        // If a callback is provided, invoke it with the error
        if (typeof completionHandler === 'function')
          completionHandler(errorObject, null);
      } else {
        // If successful, parse the location data and pass it to the callback
        if (typeof completionHandler === 'function') {
          const processedData = processPlaceData(placeIdentifier, responseValue);
          completionHandler(null, processedData);
        }
      }
    }
  );
}

/**
 * Fetches geohash scores for multiple named locations from the data store.
 * @param {object} dataStore          - Contains the Redis client instance and the sorted set key.
 * @param {string[]} placeIdentifierList - An array of location names to query.
 * @param {function} completionHandler - Callback function (error, results) to handle the operation outcome.
 */
function findMultiplePlaces(dataStore, placeIdentifierList, completionHandler) {

  // Initialize a Redis multi-transaction batch
  let transactionBatch = dataStore.redisClient.multi();
  let idx; // Loop counter for iterating through location identifiers

  // Queue ZSCORE commands for each location in the list
  for (idx = 0; idx < placeIdentifierList.length; idx++) {
    transactionBatch.zscore(dataStore.sortedSetKey, placeIdentifierList[idx]);
  }

  // Execute the batched commands
  transactionBatch.exec(function (errorObject, resultValues) {

    // Handle any error that occurred during batch execution
    if (errorObject) {
      if (typeof completionHandler === 'function')
        completionHandler(errorObject, null);
    } else {
      // Process each individual result from the batch
      const combinedResponses = [];
      for (idx = 0; idx < resultValues.length; idx++) {
        combinedResponses.push(processPlaceData(placeIdentifierList[idx], resultValues[idx]));
      }

      // Invoke the callback with the aggregated results
      if (typeof completionHandler === 'function')
        completionHandler(null, combinedResponses);
    }
  });
}

/**
 * Decodes a geohash value into latitude and longitude, associating it with a location name.
 * @param {string} placeIdentifier - The name of the location.
 * @param {string} geoHashValue    - The geohash string to be decoded.
 * @returns {object} An object containing the location's name, latitude, and longitude.
 */
function processPlaceData(placeIdentifier, geoHashValue) {

  // Decode the integer geohash into geographic coordinates
  const coordinates = geoHashProcessor.decode_int(geoHashValue, 52);

  // Return a structured object with location details
  return {
    entityName: placeIdentifier,
    latDegree: coordinates.latitude,
    lonDegree: coordinates.longitude
  };
}


/**
 * Queries the data store for members within specified geohash ranges.
 * Can optionally include scores (geohash values) in the results.
 * @param {object} dataStore          - The object holding the Redis client and sorted set key.
 * @param {Array<Array<number>>} geoRanges - An array of [min_geohash, max_geohash] pairs.
 * @param {boolean} includeScores     - Flag to determine if geohash scores should be returned with members.
 * @param {function} completionHandler - Callback function (error, results) for the operation outcome.
 */
function fetchByGeohashRanges(dataStore, geoRanges, includeScores, completionHandler) {

  // Create a new Redis multi-transaction batch
  let transactionBatch = dataStore.redisClient.multi();

  // Conditionally build the batch based on whether scores are requested
  if (includeScores === undefined || !includeScores) {
    constructBatchWithoutScores(geoRanges, dataStore.sortedSetKey, transactionBatch);
  } else {
    constructBatchWithScores(geoRanges, dataStore.sortedSetKey, transactionBatch);
  }

  // Execute the batched commands and process the results
  transactionBatch.exec(function (errorObject, resultValues) {

    if (errorObject) {
      if (typeof completionHandler === 'function')
        completionHandler(errorObject, null);
    } else {
      // Process results differently based on whether scores were included
      if (includeScores) {
        handleResultsWithScores(resultValues, completionHandler);
      } else {
        handleResultsWithoutScores(resultValues, completionHandler);
      }
    }
  });
}

/**
 * Builds a Redis multi-transaction batch to fetch members within geohash ranges, including their scores.
 * @param {Array<Array<number>>} geoRanges      - Array of [min_geohash, max_geohash] pairs.
 * @param {string} sortedSetKey         - The key of the Redis sorted set.
 * @param {object} transactionBatch     - The Redis multi-transaction object.
 */
function constructBatchWithScores(geoRanges, sortedSetKey, transactionBatch) {
  
  let currentRange = []; // Temporary variable to hold each range pair

  // Iterate through each specified geohash range
  for (let idx = 0; idx < geoRanges.length; idx++) {
    currentRange = geoRanges[idx];
    // Add a ZRANGEBYSCORE command to the batch, requesting scores
    transactionBatch.ZRANGEBYSCORE(sortedSetKey, currentRange[0], currentRange[1], 'WITHSCORES');
  }
}

/**
 * Builds a Redis multi-transaction batch to fetch members within geohash ranges, without their scores.
 * @param {Array<Array<number>>} geoRanges      - Array of [min_geohash, max_geohash] pairs.
 * @param {string} sortedSetKey         - The key of the Redis sorted set.
 * @param {object} transactionBatch     - The Redis multi-transaction object.
 */
function constructBatchWithoutScores(geoRanges, sortedSetKey, transactionBatch) {

  let currentRange = []; // Variable to store the current geohash range

  // Loop through all provided geohash range specifications
  for (let idx = 0; idx < geoRanges.length; idx++) {
    currentRange = geoRanges[idx];
    // Add a ZRANGEBYSCORE command to the batch, without requesting scores
    transactionBatch.ZRANGEBYSCORE(sortedSetKey, currentRange[0], currentRange[1]);
  }
}

/**
 * Processes results from Redis when scores were NOT requested, concatenating all members into a single array.
 * @param {Array<Array<string>>} resultValues    - Array of arrays, where each inner array contains members for a range.
 * @param {function} completionHandler - Callback function (error, combined_members).
 */
function handleResultsWithoutScores(resultValues, completionHandler) {

  const combinedResponses = []; // Accumulator for all members across ranges

  // Iterate through each set of results from the multi-exec call
  for (let idx = 0; idx < resultValues.length; idx++) {
    // Concatenate the members from the current range into the main array
    combinedResponses.push(...resultValues[idx]); 
  }

  // Invoke the callback with the final combined list of members
  if (typeof completionHandler === 'function')
    completionHandler(null, combinedResponses);
}

/**
 * Processes results from Redis when scores WERE requested, decoding geohashes and structuring the output.
 * @param {Array<Array<string>>} resultValues    - Array of arrays, where each inner array contains [member, score, member, score, ...].
 * @param {function} completionHandler - Callback function (error, structured_results).
 */
function handleResultsWithScores(resultValues, completionHandler) {

  const combinedResponses = []; // Array to store the final structured results
  let outputIndex = 0;          // Index for populating the combinedResponses array
  let decodedCoords;            // Variable to hold decoded latitude/longitude

  // Iterate through each set of results (one per range query)
  for (let idxOuter = 0; idxOuter < resultValues.length; idxOuter++) {
    // Iterate through the inner array, which contains member-score pairs
    for (let idxInner = 0; idxInner < resultValues[idxOuter].length; idxInner += 2) {
      // Decode the geohash score (which is at idxInner + 1)
      decodedCoords = geoHashProcessor.decode_int(resultValues[idxOuter][idxInner + 1], 52);
      
      // Store the member name, decoded latitude, and longitude
      combinedResponses[outputIndex] = [
        resultValues[idxOuter][idxInner],
        decodedCoords.latitude,
        decodedCoords.longitude
      ];
      outputIndex++; // Increment the output array index
    }
  }

  // Call the completion handler with the processed data
  if (typeof completionHandler === 'function')
    completionHandler(null, combinedResponses);
}


// Export the public API functions for module consumption
module.exports = exports = {
  fetchByGeohashRanges: fetchByGeohashRanges,
  findSinglePlace: findSinglePlace,
  findMultiplePlaces: findMultiplePlaces
};