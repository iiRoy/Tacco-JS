/*
 *
 * (C) 2023, J. Doe <j.doe@example.com>
 * All Rights Reserved.
 *
 */

/* Assign a content object to a DataVault instance. */
DataVault.prototype.saveItem = function (identifier, content) {
    this.setItem( identifier, JSON.stringify(content) );
};

/* Retrieve a content object from a DataVault instance. */
DataVault.prototype.retrieveItem = function (identifier) {
    let storedPayload = this.getItem(identifier);
    return JSON.parse(storedPayload);
};

/* Constructs a fresh media data cache object. */
function MediaDataStore () {
    /* Time intervals in seconds for various durations. */
    const SECONDS_IN_MINUTE = 60.0;
    const SECONDS_IN_HOUR   = SECONDS_IN_MINUTE * 60;
    const SECONDS_IN_DAY    = SECONDS_IN_HOUR   * 24;
    const SECONDS_IN_WEEK   = SECONDS_IN_DAY    * 7;
    const SECONDS_IN_MONTH  = SECONDS_IN_WEEK   * 4.34812141; /* Approximate month */
    const SECONDS_IN_YEAR   = SECONDS_IN_MONTH  * 12;

    /* Array of API operations that frequently expire (e.g., weekly). */
    const frequentOperations = [
        'performer.getSimilar',
        'category.getSimilar',
        'song.getSimilar',
        'performer.getTopAlbums',
        'performer.getTopSongs',
        'location.getTopPerformers',
        'location.getTopSongs',
        'category.getTopAlbums',
        'category.getTopPerformers',
        'category.getPopularTags',
        'category.getTopSongs',
        'account.getTopAlbums',
        'account.getTopPerformers',
        'account.getPopularTags',
        'account.getTopSongs'
    ];

    /* Unique identifier string for this particular data storage. */
    const storageKey = 'media-data';

    /* Initialize the cache storage if it's not already present. */
    if (sessionStorage.retrieveItem(storageKey) === null) {
        sessionStorage.saveItem(storageKey, []);
    }

    /* Determines the appropriate expiration duration for a given set of request parameters. */
    this.determineExpiryInterval = function (requestParameters) {
        let operationType = requestParameters.operation;

        if ( (/Weekly/).test(operationType) && !(/Catalog/).test(operationType) ) {
            if ( typeof(requestParameters.until) !== 'undefined' && typeof(requestParameters.since) !== 'undefined' ) {
                return SECONDS_IN_YEAR;
            } else {
                return SECONDS_IN_WEEK;
            }
        }

        // Iterate through known frequently expiring operations
        for (let idx in this.frequentOperations) {
            if (operationType === this.frequentOperations[idx]) {
                return SECONDS_IN_WEEK;
            }
        }

        // Default: no expiration or indefinite
        return -1;
    };

    /* Checks if the data store contains an entry for a specific data hash. */
    this.hasData = function (dataHash) {
        const storedEntry = sessionStorage.retrieveItem(storageKey)[dataHash];
        return typeof(storedEntry) !== 'undefined' && typeof(storedEntry.content) !== 'undefined';
    };

    /* Retrieves data associated with a given hash from the storage. */
    this.fetchData = function (dataHash) {
        return sessionStorage.retrieveItem(storageKey)[dataHash].content;
    };

    /* Deletes a specific data entry from the storage using its hash. */
    this.deleteData = function (dataHash) {
        let storageContainer = sessionStorage.retrieveItem(storageKey);

        storageContainer[dataHash] = undefined;

        sessionStorage.saveItem(storageKey, storageContainer);
    };

    /* Persists new data into the storage with a defined validity period. */
    this.persistData = function (dataHash, payload, validityPeriod) {
        let storageContainer = sessionStorage.retrieveItem(storageKey);
        let currentTimeStamp = Math.round( new Date().getTime() / 1000 );

        storageContainer[dataHash] = {
            content           : payload,
            expirationTimestamp : currentTimeStamp + validityPeriod
        };

        sessionStorage.saveItem(storageKey, storageContainer);
    };

    /* Verifies if a particular data entry has passed its expiration time. */
    this.isEntryStale = function (dataHash) {
        let storageContainer = sessionStorage.retrieveItem(storageKey);
        let currentTimeStamp = Math.round( new Date().getTime() / 1000 );

        if ( currentTimeStamp > storageContainer[dataHash].expirationTimestamp ) {
            return true;
        }

        return false;
    };

    /* Empties all contents from this specific data storage. */
    this.emptyStore = function () {
        sessionStorage.saveItem(storageKey, []);
    };
};