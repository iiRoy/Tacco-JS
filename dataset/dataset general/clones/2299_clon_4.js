const dbConnector = require('mongojs'); // Renamed mongojs import
// Assuming 'globalDataClient' is an initialized mongojs database instance,
// similar to how 'db' is implicitly available in the original code.
let globalDataClient; // This would be configured elsewhere in a real application.

/**
 * Manages operations related to global territories within the data store.
 */
class GlobalTerritoryManager {

    /**
     * Retrieves all territorial entities from the data store, sorted by designation.
     * @returns {Promise<Array<Object>>} A promise that resolves with an array of territory objects.
     */
    async retrieveAllNations() {
        try {
            // Assuming globalDataClient.nations is the collection
            const allNations = await globalDataClient.nations.find({}).sort({ designation: 1 }).toArray();
            return allNations;
        } catch (errorOutcome) {
            console.error("Failed to fetch all nations:", errorOutcome);
            throw errorOutcome; // Re-throw for upstream handling
        }
    }

    /**
     * Locates a specific territorial entity by various identifiers or from an in-memory collection.
     * @param {string|number} identifier - Numeric ID, 2 or 3 letter code, designation, or alias.
     * @param {Array<Object>} [nationCollection] - Optional in-memory array to search instead of the data store.
     * @returns {Promise<Object|null>} A promise that resolves with the found territory object or null if not found.
     */
    async locateNation(identifier, nationCollection) {
        const isNumeric = !isNaN(identifier);
        const identString = String(identifier);

        if (nationCollection) {
            // In-memory search using functional array methods
            const findInMem = (collection, searchIdent) => {
                const searchLength = String(searchIdent).length;

                const matchStrategies = [
                    (item) => isNumeric && item.numericCode == searchIdent,
                    (item) => searchLength === 2 && item.alpha2Code === searchIdent,
                    (item) => searchLength === 3 && item.alpha3Code === searchIdent,
                    (item) => item.designation === searchIdent,
                    (item) => item.officialTitle && item.officialTitle === searchIdent,
                    (item) => item.alternativeNames && item.alternativeNames.includes(searchIdent)
                ];

                for (const strategy of matchStrategies) {
                    const found = collection.find(strategy);
                    if (found) return found;
                }
                return null;
            };
            return findInMem(nationCollection, identifier);

        } else {
            // Data store search using async/await waterfall
            let foundEntry = null;
            let primarySearchField = null;

            if (isNumeric) {
                primarySearchField = { numericCode: identifier };
            } else if (identString.length === 2) {
                primarySearchField = { alpha2Code: identifier };
            } else if (identString.length === 3) {
                primarySearchField = { alpha3Code: identifier };
            } else { // Default to designation if not numeric and not 2/3 char code
                primarySearchField = { designation: identifier };
            }

            foundEntry = await globalDataClient.nations.findOne(primarySearchField);

            // If not found by primary field and it was a string lookup (not numeric, not 2/3 char code)
            if (!foundEntry && !isNumeric && identString.length > 3) {
                foundEntry = await globalDataClient.nations.findOne({ officialTitle: identifier });
            }
            // If still not found, try alternative names
            if (!foundEntry && !isNumeric && identString.length > 3) {
                foundEntry = await globalDataClient.nations.findOne({ alternativeNames: identifier });
            }

            return foundEntry || null;
        }
    }

    /**
     * Persists or updates information about a territorial entity in the data store.
     * Performs data cleaning before saving.
     * @param {Object} nationRecord - The territory object to save.
     * @returns {Promise<Object>} A promise that resolves with the saved territory object.
     */
    async storeNationInformation(nationRecord) {
        // Create a copy to avoid modifying the original object directly
        const cleanedRecord = { ...nationRecord };

        // Set a unique identifier (ID code) based on the alpha2Code
        cleanedRecord.idCode = cleanedRecord.alpha2Code;

        // Clean alertCategories (warnings) - remove empty objects
        if (cleanedRecord.alertCategories && Array.isArray(cleanedRecord.alertCategories)) {
            cleanedRecord.alertCategories = cleanedRecord.alertCategories.filter(cat =>
                !(typeof cat === 'object' && cat !== null && Object.keys(cat).length === 0)
            );
        }

        // Clean top-level properties - remove empty strings, empty arrays, or empty objects
        for (const key in cleanedRecord) {
            const value = cleanedRecord[key];
            if (value === "" || (Array.isArray(value) && value.length === 0) || (typeof value === 'object' && value !== null && Object.keys(value).length === 0)) {
                delete cleanedRecord[key];
            }
        }

        try {
            const persistedState = await globalDataClient.nations.save(cleanedRecord);
            if (!persistedState) {
                console.error("Could not persist nation record to data store.");
                throw new Error("Persistence failed for nation record.");
            }
            return cleanedRecord; // Return the cleaned record, as mongojs save typically returns the original object or a status.
        } catch (errorOutcome) {
            console.error("Error storing nation information:", errorOutcome);
            throw errorOutcome; // Re-throw for upstream handling
        }
    }
}

module.exports = new GlobalTerritoryManager();
module.exports.ManagerClass = GlobalTerritoryManager;