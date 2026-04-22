const dataStoreConnector = require('mongojs');
const asyncPromiseUtility = require('q');

/**
 * Manages geographical entity data within the persistent storage system.
 * This module provides functionalities to retrieve and store nation-specific information.
 */
function NationDataManager(dbConnection) {
    const database = dbConnection; // Reference to the active database connection

    /**
     * Retrieves all known nations from the database.
     * Results are presented in an ordered sequence based on their official designation.
     * @returns {Promise<Array>} A promise that resolves with an array of nation objects.
     */
    this.retrieveAllGeoEntities = function() {
        const operationPromise = asyncPromiseUtility.defer();
        
        // Query the 'nations' collection, sorting by the 'title' field in ascending order.
        database.nations.find({ '$query': {}, '$orderby': { title: 1 } }, (error, collectedEntities) => {
            if (error) {
                console.error("Failed to fetch all geographical entities:", error);
                operationPromise.reject(error); // Reject the promise on database error
                return;
            }
            operationPromise.resolve(collectedEntities || []); // Resolve with an empty array if no entities found
        });
        return operationPromise.promise;
    };

    /**
     * Locates a specific geographical entity either from a provided in-memory collection
     * or by querying the database.
     * @param {string|number} searchCriterion - The identifier for the entity (e.g., numeric ID, 2/3 letter code, name).
     * @param {Array<Object>} [inMemoryCollection] - An optional array of entities to search within first, bypassing the database.
     * @returns {Promise<Object|null>} A promise that resolves with the found entity object, or null if no match.
     */
    this.findNationDetails = function(searchCriterion, inMemoryCollection) {
        const resolutionMechanism = asyncPromiseUtility.defer();

        // Validate search criterion
        if (!searchCriterion) {
            console.warn("Attempted to find entity with empty search criterion.");
            resolutionMechanism.resolve(null);
            return resolutionMechanism.promise;
        }

        // Helper function to find an entity within a given collection by various keys
        const findInCollection = (collection, key, value) => {
            if (!collection || !Array.isArray(collection)) return null;
            for (let entity of collection) {
                if (entity && entity[key] == value) { // Use loose equality for numeric/string comparisons
                    return entity;
                }
            }
            return null;
        };

        if (inMemoryCollection && Array.isArray(inMemoryCollection) && inMemoryCollection.length > 0) {
            // Prioritize searching in the provided in-memory collection
            let locatedEntity = null;

            const numericValue = parseInt(searchCriterion, 10);
            if (!isNaN(numericValue) && String(numericValue) === String(searchCriterion)) { // Check if it's a pure numeric ID
                locatedEntity = findInCollection(inMemoryCollection, 'numericId', numericValue);
            } else if (typeof searchCriterion === 'string') {
                const normalizedCriterion = searchCriterion.trim();
                if (normalizedCriterion.length === 2) {
                    locatedEntity = findInCollection(inMemoryCollection, 'alpha2Code', normalizedCriterion);
                } else if (normalizedCriterion.length === 3) {
                    locatedEntity = findInCollection(inMemoryCollection, 'alpha3Code', normalizedCriterion);
                } else {
                    // Default to searching by primary name
                    locatedEntity = findInCollection(inMemoryCollection, 'primaryName', normalizedCriterion);
                    if (!locatedEntity) {
                        // Fallback to official designation
                        locatedEntity = findInCollection(inMemoryCollection, 'officialDesignation', normalizedCriterion);
                    }
                    if (!locatedEntity) {
                        // Check alternate names
                        for (let entity of inMemoryCollection) {
                            if (entity && Array.isArray(entity.alternateNames) && entity.alternateNames.includes(normalizedCriterion)) {
                                locatedEntity = entity;
                                break;
                            }
                        }
                    }
                }
            }
            
            resolutionMechanism.resolve(locatedEntity);
            return resolutionMechanism.promise;

        } else {
            // No in-memory collection, proceed with database lookup
            let dbQueryCriteria = {};
            const numericValue = parseInt(searchCriterion, 10);

            if (!isNaN(numericValue) && String(numericValue) === String(searchCriterion)) {
                dbQueryCriteria = { numericId: numericValue };
            } else if (typeof searchCriterion === 'string') {
                const normalizedCriterion = searchCriterion.trim();
                if (normalizedCriterion.length === 2) {
                    dbQueryCriteria = { alpha2Code: normalizedCriterion };
                } else if (normalizedCriterion.length === 3) {
                    dbQueryCriteria = { alpha3Code: normalizedCriterion };
                } else {
                    // Default to primary name search
                    dbQueryCriteria = { primaryName: normalizedCriterion };
                }
            } else {
                console.error("Unsupported search criterion type:", typeof searchCriterion);
                resolutionMechanism.resolve(null);
                return resolutionMechanism.promise;
            }

            // Execute the initial database query
            database.nations.find({ '$query': dbQueryCriteria }, (err1, matchedRecords1) => {
                if (err1) {
                    console.error("Database error during initial entity lookup:", err1);
                    resolutionMechanism.reject(err1);
                    return;
                }
                if (matchedRecords1 && matchedRecords1.length > 0) {
                    resolutionMechanism.resolve(matchedRecords1[0]);
                } else {
                    // If no match by primary criteria, attempt official designation
                    database.nations.find({ '$query': { officialDesignation: searchCriterion } }, (err2, matchedRecords2) => {
                        if (err2) {
                            console.error("Database error during official designation lookup:", err2);
                            resolutionMechanism.reject(err2);
                            return;
                        }
                        if (matchedRecords2 && matchedRecords2.length > 0) {
                            resolutionMechanism.resolve(matchedRecords2[0]);
                        } else {
                            // If still no match, search within alternate names array
                            database.nations.find({ '$query': { alternateNames: searchCriterion } }, (err3, matchedRecords3) => {
                                if (err3) {
                                    console.error("Database error during alternate names lookup:", err3);
                                    resolutionMechanism.reject(err3);
                                    return;
                                }
                                resolutionMechanism.resolve(matchedRecords3 && matchedRecords3.length > 0 ? matchedRecords3[0] : null);
                            });
                        }
                    });
                }
            });
            return resolutionMechanism.promise;
        }
    };
    
    /**
     * Persists or updates geographical entity information in the database.
     * This operation sets a unique identifier and cleans up empty fields.
     * @param {Object} entityData - The object containing nation data to be stored.
     * @returns {Promise<Object>} A promise that resolves with the saved entity object.
     */
    this.persistGeoEntity = function(entityData) {
        const completionPromise = asyncPromiseUtility.defer();

        if (!entityData || typeof entityData !== 'object') {
            console.error("Cannot persist invalid entity data:", entityData);
            completionPromise.reject(new Error("Invalid entity data provided."));
            return completionPromise.promise;
        }

        // Establish a unique identifier for the entity based on its 2-letter ISO code
        // This acts as the primary key and prevents duplicate entries for the same nation.
        if (!entityData.alpha2Code) {
            console.error("Cannot save entity without a 2-letter ISO code (alpha2Code).");
            completionPromise.reject(new Error("Missing alpha2Code for entity."));
            return completionPromise.promise;
        }
        entityData._id = entityData.alpha2Code;
        entityData.lastModified = new Date(); // Add a timestamp for the last modification

        // Clean up any empty warning categories or general empty fields
        if (entityData.advisoryCategories && Array.isArray(entityData.advisoryCategories)) {
            entityData.advisoryCategories = entityData.advisoryCategories.filter(category => 
                category && Object.keys(category).length > 0
            );
        }
        
        // Iterate through all properties and remove those with empty string, empty array, or empty object values
        for (const propKey in entityData) {
            if (Object.prototype.hasOwnProperty.call(entityData, propKey)) {
                const value = entityData[propKey];
                if (value === "" || (Array.isArray(value) && value.length === 0) || (typeof value === 'object' && value !== null && Object.keys(value).length === 0)) {
                    delete entityData[propKey];
                }
            }
        }

        // Perform the save/update operation in the database
        database.nations.save( entityData, (storageError, savedResult) => {
            if (storageError || !savedResult) {
                console.error(`Failed to store geographical entity data for ${entityData.primaryName || entityData._id}:`, storageError);
                completionPromise.reject(storageError || new Error("Entity data could not be saved."));
            } else {
                console.info(`Successfully stored entity: ${entityData.primaryName || entityData._id}`);
                completionPromise.resolve(entityData); // Resolve with the (potentially modified) entity data
            }
        });
        return completionPromise.promise;
    };
}

// Initializing the module with a placeholder for the database connection.
// In a real application, 'db' would be properly instantiated and passed here.
// For this example, we assume 'db' is a globally accessible mongojs instance or passed via require setup.
// To make it explicit and follow good practices, we'll assume `db` is available from `dataStoreConnector`
// and configure it based on a typical mongojs setup.
// For the purpose of this clone, we'll assume a `db` object is available through context or dependency injection.
// Let's create a mock `db` if not provided, for demonstration.

const mockDb = {
    nations: {
        find: (query, callback) => { /* mock implementation */ callback(null, []); },
        save: (data, callback) => { /* mock implementation */ callback(null, data); }
    }
};

const configuredDb = dataStoreConnector('mongodb://localhost/testdb', ['nations']); // Example connection

// Export the instantiated manager and its constructor for potential reuse or extension.
module.exports = new NationDataManager(configuredDb);
module.exports.ManagerConstructor = NationDataManager;