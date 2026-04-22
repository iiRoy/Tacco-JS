// This module enhances browser's native Storage capabilities, enabling direct storage and retrieval of JavaScript objects
// by automatically handling JSON serialization and deserialization. It also includes a robust caching mechanism.

// Extends the prototype of the global Storage object (e.g., localStorage, sessionStorage)
// to provide a convenient method for saving JavaScript objects as JSON strings.
Storage.prototype.saveJSONPayload = function(dataKey, objectToPersist) {
    // A brief note: This function aims to store an arbitrary JS object.
    // Ensure the input 'objectToPersist' is a valid JSON-serializable entity.
    if (objectToPersist === null || typeof objectToPersist === 'undefined') {
        // Explicitly store 'null' as a string if the object is null or undefined,
        // to differentiate from a non-existent key.
        this.setItem(dataKey, 'null_value');
        return;
    }

    try {
        const serializedData = JSON.stringify(objectToPersist);
        this.setItem(dataKey, serializedData);
    } catch (serializationError) {
        // Log an error if the object cannot be converted to JSON,
        // which might happen with circular references or non-serializable types.
        console.error(`Error saving JSON payload for key '${dataKey}': Failed to serialize object.`, serializationError);
        // Depending on requirements, one might throw the error, return false, or store a default.
    }
};

// Extends the prototype of the global Storage object to retrieve and parse
// a JSON string back into a JavaScript object.
Storage.prototype.fetchJSONItem = function(dataKey) {
    // Retrieve the raw string value associated with the dataKey.
    const rawStoredString = this.getItem(dataKey);

    // If the key doesn't exist, or it was explicitly stored as 'null_value', return null.
    if (rawStoredString === null || rawStoredString === 'null_value') {
        return null;
    }

    try {
        // Attempt to parse the retrieved string as JSON.
        return JSON.parse(rawStoredString);
    } catch (parsingError) {
        // Log an error if the stored string is not valid JSON,
        // indicating potential data corruption or a non-JSON item.
        console.error(`Error fetching JSON item for key '${dataKey}': Failed to parse stored data.`, parsingError);
        // Return null to signify that a valid object could not be retrieved.
        return null;
    }
};


// Defines a constructor for a sophisticated data caching system.
// This system manages API responses within local storage, incorporating
// expiration logic and handling various API endpoint types.
function PersistentDataStore() {
    // Standard time constants, measured in seconds, for defining cache lifetimes.
    const DURATION_ONE_MINUTE = 60;
    const DURATION_ONE_HOUR   = DURATION_ONE_MINUTE * 60;
    const DURATION_ONE_DAY    = DURATION_ONE_HOUR * 24;
    const DURATION_ONE_WEEK   = DURATION_ONE_DAY * 7;
    // Approximations for longer periods, useful for less precise caching needs.
    const DURATION_APPROX_MONTH = DURATION_ONE_WEEK * 4.348; // About 30.4 days
    const DURATION_APPROX_YEAR  = DURATION_APPROX_MONTH * 12;

    // A predefined list of API endpoints that are generally considered
    // to have frequently changing data, thus warranting a shorter cache duration (e.g., weekly).
    const highVolatilityEndpoints = new Set([
        'artist.getSimilar', 'tag.getSimilar', 'track.getSimilar',
        'artist.getTopAlbums', 'artist.getTopTracks',
        'geo.getTopArtists', 'geo.getTopTracks',
        'tag.getTopAlbums', 'tag.getTopArtists', 'tag.getTopTags', 'tag.getTopTracks',
        'user.getTopAlbums', 'user.getTopArtists', 'user.getTopTags', 'user.getTopTracks'
    ]);

    // The primary key under which all cache data for this instance is stored in `localStorage`.
    // Includes a version identifier to facilitate cache invalidation upon schema changes.
    const storageIdentifier = 'app_api_cache_v3';

    // Internal reference to the storage mechanism. Defaults to `localStorage`.
    // This allows for easier testing or future adaptation to other storage backends.
    const _storageProvider = window.localStorage;

    // A utility function to retrieve the current time in seconds since the Unix epoch.
    const _getUnixTimestampInSeconds = () => Math.floor(Date.now() / 1000);

    // Initial check and setup for the cache container in storage.
    // If the storage provider is unavailable, or the cache doesn't exist/is corrupted,
    // initialize it as an empty object.
    if (!_storageProvider || !_storageProvider.fetchJSONItem(storageIdentifier) || !(_storageProvider.fetchJSONItem(storageIdentifier) instanceof Object)) {
        if (_storageProvider) {
            _storageProvider.saveJSONPayload(storageIdentifier, {});
            console.info(`Cache '${storageIdentifier}' initialized or reset.`);
        } else {
            console.warn('Local storage not available. Caching functionality will be limited.');
            // This could be enhanced to use an in-memory fallback cache.
        }
    }

    /**
     * Determines the appropriate cache expiration time in seconds for a given API request.
     * Rules are applied based on the API endpoint method and specific request parameters.
     * @param {object} apiRequestParams - An object containing details of the API request,
     *                                    typically including a 'method' string and other query parameters.
     * @returns {number} The calculated expiration duration in seconds. Returns -1 if no specific
     *                   rule matches, suggesting a default or no caching for this request.
     */
    this.determineExpiryDuration = function(apiRequestParams) {
        const operationName = apiRequestParams?.method;

        // Validate the operation name. If invalid, no specific duration can be determined.
        if (typeof operationName !== 'string' || operationName.trim() === '') {
            console.warn('Invalid API operation name provided for expiry calculation.');
            return -1;
        }

        // Check for methods explicitly containing 'Weekly' but not 'List',
        // which might indicate different caching needs based on 'from'/'to' date parameters.
        if (operationName.includes('Weekly') && !operationName.includes('List')) {
            if (apiRequestParams.to !== undefined && apiRequestParams.from !== undefined) {
                // If a specific date range is provided, it's often for historical data,
                // which can be cached for a longer period.
                return DURATION_APPROX_YEAR;
            } else {
                // Otherwise, a standard weekly duration applies.
                return DURATION_ONE_WEEK;
            }
        }

        // Check if the operation name is part of the high volatility set.
        if (highVolatilityEndpoints.has(operationName)) {
            return DURATION_ONE_WEEK;
        }

        // If no specific rule matches, return -1 to indicate no custom expiration.
        return -1;
    };

    /**
     * Checks whether an entry corresponding to a given identifier exists in the cache
     * and contains valid data.
     * @param {string} entryIdentifier - The unique key (hash) for the cache entry.
     * @returns {boolean} True if the entry exists and has data, false otherwise.
     */
    this.entryExists = function(entryIdentifier) {
        const currentCacheMap = _storageProvider.fetchJSONItem(storageIdentifier);
        // Uses optional chaining for safe access. Returns true if the entry and its 'payload' property exist.
        return !!currentCacheMap?.[entryIdentifier]?.payload;
    };

    /**
     * Retrieves the cached data associated with a specific entry identifier.
     * @param {string} entryIdentifier - The unique key (hash) for the cache entry.
     * @returns {*} The cached data, or null if the entry is not found or is malformed.
     */
    this.retrieveEntryData = function(entryIdentifier) {
        const currentCacheMap = _storageProvider.fetchJSONItem(storageIdentifier);
        const cacheRecord = currentCacheMap?.[entryIdentifier];

        // Ensure the record exists and contains a 'payload' before returning.
        if (cacheRecord && cacheRecord.payload !== undefined) {
            return cacheRecord.payload;
        }
        return null; // No valid data found for the given identifier.
    };

    /**
     * Removes a specific data entry from the cache.
     * @param {string} entryIdentifier - The unique key (hash) of the entry to be removed.
     */
    this.purgeEntry = function(entryIdentifier) {
        const currentCacheMap = _storageProvider.fetchJSONItem(storageIdentifier);

        // Check if the map exists and if the entry is actually present before attempting deletion.
        if (currentCacheMap && Object.prototype.hasOwnProperty.call(currentCacheMap, entryIdentifier)) {
            delete currentCacheMap[entryIdentifier]; // Use 'delete' operator for clean property removal.
            _storageProvider.saveJSONPayload(storageIdentifier, currentCacheMap);
            console.debug(`Cache entry '${entryIdentifier}' purged.`);
        } else {
            console.debug(`Attempted to purge non-existent cache entry: '${entryIdentifier}'.`);
        }
    };

    /**
     * Stores new data in the cache with a specified expiration duration.
     * @param {string} entryIdentifier - A unique key (hash) to identify this cached data.
     * @param {*} dataPayload - The actual data (e.g., API response) to be stored.
     * @param {number} expirySeconds - The number of seconds from now until the entry expires.
     */
    this.storeDataInCache = function(entryIdentifier, dataPayload, expirySeconds) {
        // Basic validation for input parameters.
        if (!entryIdentifier || dataPayload === undefined || typeof expirySeconds !== 'number' || expirySeconds < 0) {
            console.error('Invalid parameters for storing data in cache. Check identifier, payload, and expiry seconds.');
            return;
        }

        const currentCacheMap = _storageProvider.fetchJSONItem(storageIdentifier);
        const currentTimestamp = _getUnixTimestampInSeconds();

        currentCacheMap[entryIdentifier] = {
            payload: dataPayload,
            expiresAtTimestamp: currentTimestamp + expirySeconds // Store the absolute expiration timestamp.
        };

        _storageProvider.saveJSONPayload(storageIdentifier, currentCacheMap);
        console.debug(`Data stored for '${entryIdentifier}', expires in ${expirySeconds}s.`);
    };

    /**
     * Determines if a specific cached entry has passed its expiration timestamp.
     * @param {string} entryIdentifier - The unique key (hash) for the cache entry.
     * @returns {boolean} True if the entry is expired, missing, or malformed; false otherwise.
     */
    this.isEntryStale = function(entryIdentifier) {
        const currentCacheMap = _storageProvider.fetchJSONItem(storageIdentifier);
        const cacheRecord = currentCacheMap?.[entryIdentifier];

        // If the record doesn't exist, or is missing essential properties, it's considered stale.
        if (!cacheRecord || cacheRecord.payload === undefined || cacheRecord.expiresAtTimestamp === undefined) {
            return true;
        }

        const currentTimestamp = _getUnixTimestampInSeconds();
        return currentTimestamp > cacheRecord.expiresAtTimestamp;
    };

    /**
     * Completely clears all data managed by this cache instance from storage.
     */
    this.clearAllEntries = function() {
        if (_storageProvider) {
            _storageProvider.saveJSONPayload(storageIdentifier, {}); // Overwrite with an empty object.
            console.info(`All entries in cache '${storageIdentifier}' have been cleared.`);
        } else {
            console.warn('Storage provider not available; cannot clear cache.');
        }
    };
}