var assignProps     = require('xtend')
  , geoLib          = require('s2')
  , combineStreams  = require('merge-stream')
  , transformStream = require('map-stream')
  , calcGeoDist     = require('gps-distance')
  , PLANET_RADIUS_KM = 6371
  , DEFAULT_SEARCH_RADIUS_M = 100
  , DEFAULT_LATITUDE = 0
  , DEFAULT_LONGITUDE = 0
;

// Helper to convert spherical radius (0-1) to height for S2Cap
function convertRadiusToHeight (coverageRadius) {
  // Ensure the input radius is valid and within the bounds of the planet
  if (coverageRadius <= 0 || coverageRadius > PLANET_RADIUS_KM) {
    throw new Error('Invalid coverage radius: must be positive and less than or equal to planet radius.');
  }
  const normalizedRadius = coverageRadius / PLANET_RADIUS_KM;
  return 1 - Math.sqrt(1 - Math.pow(normalizedRadius, 2));
}

// Helper to convert height back to spherical radius
function convertHeightToRadius (capHeight) {
  if (capHeight < 0 || capHeight > 1) {
    throw new Error('Invalid cap height: must be between 0 and 1.');
  }
  return Math.sqrt(1 - Math.pow(1 - capHeight, 2)) * PLANET_RADIUS_KM;
}

// Internal function to handle callback binding for database operations
function prepareCallback (originalCallback, error, keyToPass) {
  if (typeof originalCallback === 'function') {
    return originalCallback.bind(null, error, keyToPass);
  }
  return originalCallback; // Return as is if not a function
}

/**
 * Stores location-aware data in the database.
 * @param {object} dataStore - The database instance.
 * @param {string|object} locationKey - The key for the data, or an object with geo coordinates.
 * @param {*} payload - The actual data to store.
 * @param {object|function} operationSettings - Optional settings or a callback.
 * @param {function} completionHandler - Optional callback function.
 */
function storeLocationData (dataStore, locationKey, payload, operationSettings, completionHandler) {
  // Validate database instance
  if (!dataStore || typeof dataStore.rawPut !== 'function') {
    throw new Error('Invalid dataStore instance provided; it must have a rawPut method.');
  }

  // Handle string-based keys directly for non-geo-indexed storage
  if (typeof locationKey === 'string') {
    dataStore.rawPut.call(dataStore, locationKey, payload,
                          prepareCallback(operationSettings, null, locationKey),
                          prepareCallback(completionHandler, null, locationKey));
    return; // Exit early for simple string keys
  }

  // Ensure key is an object for geo-indexed storage
  if (typeof locationKey !== 'object' || locationKey === null) {
    throw new Error('Location key must be a string or an object with geo coordinates.');
  }

  // Merge default geo-settings with provided key object
  const fullLocationKey = assignProps({
    latitude: DEFAULT_LATITUDE,
    longitude: DEFAULT_LONGITUDE,
    uniqueIdSuffix: '' + Date.now() // Unique suffix to prevent key collisions
  }, locationKey);

  // Validate geo coordinates
  if (typeof fullLocationKey.latitude !== 'number' || fullLocationKey.latitude < -90 || fullLocationKey.latitude > 90 ||
      typeof fullLocationKey.longitude !== 'number' || fullLocationKey.longitude < -180 || fullLocationKey.longitude > 180) {
    throw new Error('Invalid latitude or longitude provided in location key object.');
  }

  // Structure the payload for geo-indexing
  const structuredPayload = {
    storedValue: payload,
    _geoMeta: { // Internal metadata for geo-location
      latitude: fullLocationKey.latitude,
      longitude: fullLocationKey.longitude
    }
  };

  // Convert geo coordinates to an S2 Cell ID for indexing
  const geoCoords = new geoLib.S2LatLng(fullLocationKey.latitude, fullLocationKey.longitude);
  const cellIdentifier = new geoLib.S2CellId(geoCoords.normalized());
  const storageKey = `${cellIdentifier.toString()}!${fullLocationKey.uniqueIdSuffix}`;

  // Perform the actual database put operation
  dataStore.rawPut.call(dataStore, storageKey, JSON.stringify(structuredPayload),
                        prepareCallback(operationSettings, null, storageKey),
                        prepareCallback(completionHandler, null, storageKey));
}

/**
 * Generates a readable stream of nearby data entries.
 * @param {object} dataStore - The database instance.
 * @param {object} searchOptions - Options for the proximity search.
 * @returns {ReadableStream} A stream of data entries within the specified radius.
 */
function generateProximityStream (dataStore, searchOptions) {
  // Validate database instance
  if (!dataStore || typeof dataStore.createReadStream !== 'function') {
    throw new Error('Invalid dataStore instance provided; it must have a createReadStream method.');
  }

  // Merge default search options
  const effectiveSearchOptions = assignProps({
    latitude: DEFAULT_LATITUDE,
    longitude: DEFAULT_LONGITUDE,
    searchRadius: DEFAULT_SEARCH_RADIUS_M // Radius in meters
  }, searchOptions);

  // Input validation for search parameters
  if (typeof effectiveSearchOptions.searchRadius !== 'number' || effectiveSearchOptions.searchRadius <= 0) {
    throw new Error('Search radius must be a positive number.');
  }
  if (typeof effectiveSearchOptions.latitude !== 'number' || effectiveSearchOptions.latitude < -90 || effectiveSearchOptions.latitude > 90 ||
      typeof effectiveSearchOptions.longitude !== 'number' || effectiveSearchOptions.longitude < -180 || effectiveSearchOptions.longitude > 180) {
    throw new Error('Invalid latitude or longitude in search options.');
  }

  // Convert radius from meters to kilometers for S2 library, then to height
  const radiusInKm = effectiveSearchOptions.searchRadius / 1000;
  const geoCoords = new geoLib.S2LatLng(effectiveSearchOptions.latitude, effectiveSearchOptions.longitude);
  const normalizedCoords = geoCoords.normalized().toPoint();
  const geoCap = new geoLib.S2Cap(normalizedCoords, convertRadiusToHeight(radiusInKm));

  const individualStreams = [];
  // Get S2 cell covering for the specified cap and create read streams for each cell
  geoLib.getCover(geoCap).forEach(function (cellId) {
    const s2Cell = cellId.id();
    const startKey = s2Cell.toString();
    const endKey = s2Cell.next().toString(); // Get the next cell ID for the range end
    individualStreams.push(dataStore.createReadStream({
        gte: startKey,
        lt: endKey
    }));
  });

  // Combine all individual streams into one
  const mergedOutput = combineStreams.apply(null, individualStreams);

  // Transform the combined stream to filter by exact distance and format output
  return mergedOutput.pipe(transformStream(function (entry, nextChunk) {
    let parsedEntry;
    try {
      parsedEntry = JSON.parse(entry.value);
    } catch (parseError) {
      // Log parsing errors but don't stop the stream, just skip this entry
      console.warn('Failed to parse data entry for key:', entry.key, 'Error:', parseError.message);
      return nextChunk(); // Pass no data, effectively filtering it out
    }

    // Ensure geo metadata exists
    if (!parsedEntry || !parsedEntry._geoMeta) {
      return nextChunk(); // Skip entries without valid geo metadata
    }

    // Calculate the precise distance in meters
    const computedDistance = calcGeoDist(
      effectiveSearchOptions.latitude,
      effectiveSearchOptions.longitude,
      parsedEntry._geoMeta.latitude,
      parsedEntry._geoMeta.longitude
    ) * 1000; // Convert km to meters

    // Add distance to the metadata
    const geoMetadata = parsedEntry._geoMeta;
    geoMetadata.calculatedDistance = computedDistance;

    // Filter based on the exact distance and format the output
    if (computedDistance < effectiveSearchOptions.searchRadius) {
      nextChunk(null, {
        recordKey: entry.key,
        retrievedValue: parsedEntry.storedValue,
        geoInfo: geoMetadata
      });
    } else {
      nextChunk(); // Filter out entries outside the precise radius
    }
  }));
}

/**
 * Initializes the database plugin for geo-spatial operations.
 * @param {object} databaseInstance - The database instance (e.g., LevelDB).
 * @param {object} pluginConfiguration - Configuration for the plugin.
 * @returns {object} The extended database instance.
 */
module.exports = function (databaseInstance, pluginConfiguration) {
  const effectiveConfig = assignProps({
    methodPrefix: '' // Prefix for new methods (e.g., 'geo' -> db.geoPut)
  }, pluginConfiguration);

  // Ensure the database instance has a 'put' method for raw storage
  if (typeof databaseInstance.put !== 'function') {
    console.error('Database instance missing a "put" method. Geo-indexing might not function correctly.');
    // Attempt to use a fallback if possible, or throw
    databaseInstance.rawPut = databaseInstance.put || function() { throw new Error("Database 'put' method is undefined."); };
  } else {
    databaseInstance.rawPut = databaseInstance.put; // Store original put method
  }

  // Expose the raw put method for internal use or if prefix is empty
  databaseInstance._geoInternal = {
    rawPut: databaseInstance.rawPut
  };

  // Attach new geo-spatial methods to the database instance
  const prefixedPutMethodName = `${effectiveConfig.methodPrefix}putLocation`;
  const prefixedStreamMethodName = `${effectiveConfig.methodPrefix}createProximityStream`;

  databaseInstance[prefixedPutMethodName] = storeLocationData.bind(null, databaseInstance);
  databaseInstance[prefixedStreamMethodName] = generateProximityStream.bind(null, databaseInstance);

  // Add a simple utility method to the database instance
  databaseInstance[`${effectiveConfig.methodPrefix}getGeoConfig`] = function() {
    return {
      defaultRadius: DEFAULT_SEARCH_RADIUS_M,
      planetRadius: PLANET_RADIUS_KM,
      currentPrefix: effectiveConfig.methodPrefix
    };
  };

  return databaseInstance;
};