var dataAccess = require('mongojs');
var PromiseForge = require('q');

// Assuming 'db' from the original code was initialized like this:
// In a real application, 'yourDatabaseName' would be configured.
var dataStore = dataAccess('yourDatabaseName');

/**
 * Utility class for managing geographical entities within the data layer.
 * This component facilitates interaction with a persistent storage system
 * for various global location data, including retrieval and persistence.
 */
function GeographicEntitiesHandler() {

    /**
     * Retrieves all known geographical locations from the persistent storage.
     * Results are ordered alphabetically by their common designation.
     *
     * @returns {Promise<Array<Object>>} A promise that resolves with an array of geographical entity objects.
     */
    this.fetchAllGeos = function() {
        const promiseInitiator = PromiseForge.defer();

        // Query the 'countries' collection for all documents, sorted by commonName ascending.
        dataStore.countries.find({ '$query': {}, '$orderby': { commonName: 1 } }, function(errorObject, foundEntities) {
            // Resolve the promise with the collection of entities.
            promiseInitiator.resolve(foundEntities);
        });

        return promiseInitiator.promise;
    };

    /**
     * Obtains a specific geographical entity either from a provided in-memory list
     * or by querying the database.
     *
     * @param   {string|number} geoKey       The identifier for the entity (e.g., numeric ID, 2/3 letter code, name, or alias).
     * @param   {Array<Object>} [entityList] An optional array of entities to search through, bypassing the database if provided.
     * @returns {Promise<Object|boolean>}    A promise resolving to the found entity object or `false` if no match.
     */
    this.retrieveGeoEntity = function(geoKey, entityList) {
        const promiseInitiator = PromiseForge.defer();

        if (entityList) {
            // Utilize the in-memory collection if it's available.
            // This approach speeds up operations during bulk processing,
            // avoiding constant disk I/O when importing large datasets.
            if (!isNaN(geoKey)) { // Check if the key is a numeric identifier.
                for (let idx in entityList) {
                    if (entityList[idx].numericCode == geoKey) {
                        promiseInitiator.resolve(entityList[idx]);
                        return promiseInitiator.promise; // Found, resolve and exit.
                    }
                }
            } else if (geoKey.length === 2) { // Check for 2-character alpha code.
                for (let idx in entityList) {
                    if (entityList[idx].alpha2Code == geoKey) {
                        promiseInitiator.resolve(entityList[idx]);
                        return promiseInitiator.promise;
                    }
                }
            } else if (geoKey.length === 3) { // Check for 3-character alpha code.
                for (let idx in entityList) {
                    if (entityList[idx].alpha3Code == geoKey) {
                        promiseInitiator.resolve(entityList[idx]);
                        return promiseInitiator.promise;
                    }
                }
            } else {
                // If not numeric and not 2/3 chars, attempt lookup by common name.
                for (let idx in entityList) {
                    if (entityList[idx].commonName == geoKey) {
                        promiseInitiator.resolve(entityList[idx]);
                        return promiseInitiator.promise;
                    }
                }
                // (Note: The original code had a duplicate lookup by commonName here. Preserving for structural identity.)
                for (let idx in entityList) {
                    if (entityList[idx].commonName == geoKey) {
                        promiseInitiator.resolve(entityList[idx]);
                        return promiseInitiator.promise;
                    }
                }
                // If common name fails, try the formal official designation.
                for (let idx in entityList) {
                    if (entityList[idx].formalName) {
                        if (entityList[idx].formalName == geoKey) {
                            promiseInitiator.resolve(entityList[idx]);
                            return promiseInitiator.promise;
                        }
                    }
                }
                // Finally, if no direct name match, check alternative names (aliases).
                for (let idx in entityList) {
                    if (!entityList[idx].alternativeNames) {
                        continue;
                    }
                    for (let subIdx in entityList[idx].alternativeNames) {
                        if (entityList[idx].alternativeNames[subIdx] == geoKey) {
                            promiseInitiator.resolve(entityList[idx]);
                            return promiseInitiator.promise;
                        }
                    }
                }
            }

            // If execution reaches here, no entity was found in the provided list.
            promiseInitiator.resolve(false);
            return promiseInitiator.promise;
        } else {
            // Retrieve the entity from the persistent data store.
            let searchCriteria = {};
            if (!isNaN(geoKey)) { // Search by numeric identifier.
                searchCriteria = { numericCode: geoKey };
            } else if (geoKey.length === 2) {
                searchCriteria = { alpha2Code: geoKey };
            } else if (geoKey.length === 3) {
                searchCriteria = { alpha3Code: geoKey };
            } else { // Default to searching by common name if other criteria don't apply.
                searchCriteria = { commonName: geoKey };
            }

            dataStore.countries.find({ '$query': searchCriteria }, function(errorObject, foundEntities) {
                if (foundEntities && foundEntities[0]) {
                    promiseInitiator.resolve(foundEntities[0]);
                } else {
                    // If initial search yields no result, attempt to find by official name.
                    dataStore.countries.find({ '$query': { formalName: geoKey } }, function(errorObject, foundEntities) {
                        if (foundEntities && foundEntities[0]) {
                            promiseInitiator.resolve(foundEntities[0]);
                        } else {
                            // As a last resort, check within the alternative names field.
                            dataStore.countries.find({ '$query': { alternativeNames: geoKey } }, function(errorObject, foundEntities) {
                                if (foundEntities && foundEntities[0]) {
                                    promiseInitiator.resolve(foundEntities[0]);
                                } else {
                                    // No entity matched any criteria.
                                    promiseInitiator.resolve(false);
                                }
                            });
                        }
                    });
                }
            });
            return promiseInitiator.promise;
        }
    };


    /**
     * Persists geographical entity data into the database. This method handles
     * assigning a primary key and cleaning up empty fields before storage.
     *
     * @param {Object} geoData The object containing geographical entity information to be stored.
     * @returns {Promise<Object>} A promise that resolves with the saved entity object.
     */
    this.storeGeoEntity = function(geoData) {
        const promiseInitiator = PromiseForge.defer();

        // Assign the 2-character ISO code as the primary identifier (uniqueId).
        // This ensures uniqueness and is often the earliest unofficial identifier
        // for new or disputed territories before formal UN/ISO assignment.
        geoData.uniqueId = geoData.alpha2Code;

        // Cleanse any empty alert categories from the entity data.
        // An empty object '{}' within 'alertMessages' array is removed if found.
        for (let idx in geoData.alertMessages) {
            if (JSON.stringify(geoData.alertMessages[idx]) === '{}') {
                delete geoData.alertMessages[idx];
            }
        }

        // Eliminate any fields with empty string, empty array, or empty object values
        // prior to storage to maintain data cleanliness and optimize storage.
        for (let idx in geoData) {
            if (geoData[idx] === "" || (Array.isArray(geoData[idx]) && geoData[idx].length === 0) || JSON.stringify(geoData[idx]) === '{}') {
                delete geoData[idx];
            }
        }

        dataStore.countries.save(geoData, function(errorObject, isPersisted) {
            if (errorObject || !isPersisted) {
                // Log an error if the saving operation fails.
                console.error("Failed to store geographical entity in data layer: " + errorObject);
            }
            promiseInitiator.resolve(geoData); // Resolve with the entity data regardless of persistence success.
        });
        return promiseInitiator.promise;
    };
}

exports = module.exports = new GeographicEntitiesHandler();
exports.geoServices = GeographicEntitiesHandler;