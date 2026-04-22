const fileSystem = require('fs');
const pathResolver = require('path');

// Auxiliary function for creating a deep clone of simple JSON structures
function replicateDeeply(inputSubject) {
  return JSON.parse(JSON.stringify(inputSubject));
}

// Auxiliary function to extract specified properties from an object
function selectSpecificProperties(sourceObject, propertyKeys) {
  const extracted = {};
  for (const key of propertyKeys) {
    if (Object.prototype.hasOwnProperty.call(sourceObject, key)) {
      extracted[key] = sourceObject[key];
    }
  }
  return extracted;
}

// Auxiliary function to exclude specified properties from an object
function filterOutProperties(sourceObject, propertyKeysToExclude) {
  const remaining = {};
  for (const key in sourceObject) {
    if (Object.prototype.hasOwnProperty.call(sourceObject, key) && !propertyKeysToExclude.includes(key)) {
      remaining[key] = sourceObject[key];
    }
  }
  return remaining;
}

// Main factory function for the data seeding utility
module.exports = function initializeDataManager(sourceDirectory) {
  const internalDataStore = {
    payloadCollections: {}, // Stores the parsed JSON fixture data
    identifierMappings: {}, // Maps fixture positions to actual database IDs
    relationshipDefinitions: {}, // Stores association metadata for each entity
    availableEntities: [] // List of entity names loaded from fixtures
  };

  // Immediate execution block to load fixture data upon manager initialization
  (function loadInitialData() {
    sourceDirectory = sourceDirectory || pathResolver.join(process.cwd(), 'test', 'fixtures');
    const directoryContents = fileSystem.readdirSync(sourceDirectory);

    for (const entryName of directoryContents) {
      if (pathResolver.extname(entryName).toLowerCase() === '.json') {
        const entityKey = pathResolver.basename(entryName, '.json').toLowerCase();
        const fullFilePath = pathResolver.join(sourceDirectory, entryName);
        const fileContent = fileSystem.readFileSync(fullFilePath, 'utf8');
        internalDataStore.payloadCollections[entityKey] = JSON.parse(fileContent);
      }
    }
    internalDataStore.availableEntities = Object.keys(internalDataStore.payloadCollections);
  })();

  // --- Core asynchronous operations for data management ---

  // Asynchronously establishes inter-entity relationships based on loaded data and mappings
  async function establishEntityConnections(entityKeysToProcess, finalCompletion) {
    if (!Array.isArray(entityKeysToProcess)) {
      finalCompletion = entityKeysToProcess;
      entityKeysToProcess = internalDataStore.availableEntities;
    }

    // Standardize entity keys to lowercase
    entityKeysToProcess = entityKeysToProcess.map(key => key.toLowerCase());

    try {
      for (const currentEntityKey of entityKeysToProcess) {
        const EntitySchema = globalDataRegistry.entitySchemas[currentEntityKey]; // Assuming 'globalDataRegistry' is available
        if (!EntitySchema) {
          continue; // Skip if no schema is defined for this entity
        }

        const currentPayloadItems = replicateDeeply(internalDataStore.payloadCollections[currentEntityKey]);
        let itemSequence = 0;

        for (const itemData of currentPayloadItems) {
          const sequenceIndex = itemSequence++;

          // Retrieve the existing database record using the mapped ID
          const databaseRecord = await EntitySchema.findOne(internalDataStore.identifierMappings[currentEntityKey][sequenceIndex]).exec();
          if (!databaseRecord) {
            // Log a warning if a record isn't found, but continue processing others
            console.warn(`Database record for entity ${currentEntityKey} at mapped ID ${internalDataStore.identifierMappings[currentEntityKey][sequenceIndex]} not found. Skipping relation establishment for this item.`);
            continue;
          }

          // Isolate only the attributes that define relationships
          const relationshipAttributes = selectSpecificProperties(itemData, Object.keys(internalDataStore.relationshipDefinitions[currentEntityKey]));

          for (const attributeName of Object.keys(relationshipAttributes)) {
            const relationshipDescriptor = internalDataStore.relationshipDefinitions[currentEntityKey][attributeName];
            const targetEntityKey = relationshipDescriptor[relationshipDescriptor.type]; // e.g., 'model' or 'collection' type

            if (!Array.isArray(relationshipAttributes[attributeName])) {
              // Handle single (belongsTo/hasOne) relationship
              const targetId = internalDataStore.identifierMappings[targetEntityKey][relationshipAttributes[attributeName] - 1];
              databaseRecord[attributeName] = targetId;
            } else {
              // Handle multiple (hasMany/many-to-many) relationships
              if (databaseRecord[attributeName] && typeof databaseRecord[attributeName].add === 'function') {
                // Utilize ORM's 'add' method for collections, if available
                for (const referenceIndex of relationshipAttributes[attributeName]) {
                  const targetId = internalDataStore.identifierMappings[targetEntityKey][referenceIndex - 1];
                  databaseRecord[attributeName].add(targetId);
                }
              } else {
                // Fallback for simple arrays or if 'add' is not present
                databaseRecord[attributeName] = relationshipAttributes[attributeName].map(referenceIndex =>
                  internalDataStore.identifierMappings[targetEntityKey][referenceIndex - 1]
                );
              }
            }
            await databaseRecord.save(); // Persist changes to the database
          }
        }
      }
      finalCompletion(); // Indicate successful completion
    } catch (operationError) {
      finalCompletion(operationError); // Propagate any errors
    }
  }

  // Asynchronously inserts fixture payloads into the database
  async function ingestPayloads(entityKeysToProcess, finalCompletion, autoConnect) {
    if (!Array.isArray(entityKeysToProcess)) {
      autoConnect = finalCompletion;
      finalCompletion = entityKeysToProcess;
      entityKeysToProcess = internalDataStore.availableEntities;
    } else {
      entityKeysToProcess = entityKeysToProcess.map(key => key.toLowerCase());
    }
    autoConnect = !(autoConnect === false); // Default 'autoConnect' to true

    try {
      for (const currentEntityKey of entityKeysToProcess) {
        const EntitySchema = globalDataRegistry.entitySchemas[currentEntityKey];
        if (!EntitySchema) {
          continue;
        }

        // Clear existing records in the database table/collection
        await EntitySchema.destroy().exec();

        // Store the entity's relationship metadata
        internalDataStore.relationshipDefinitions[currentEntityKey] = {};
        for (const definition of EntitySchema.associations) {
          internalDataStore.relationshipDefinitions[currentEntityKey][definition.alias] = definition;
        }

        internalDataStore.identifierMappings[currentEntityKey] = [];
        const currentPayloadItems = replicateDeeply(internalDataStore.payloadCollections[currentEntityKey]);
        let itemSequence = 0;

        for (const itemData of currentPayloadItems) {
          const sequenceIndex = itemSequence++;

          let payloadForInsertion = itemData;
          if (autoConnect) {
            // Remove relationship data if auto-connection is enabled
            payloadForInsertion = filterOutProperties(itemData, Object.keys(internalDataStore.relationshipDefinitions[currentEntityKey]));
          }

          // Create the new record in the database
          const createdRecord = await EntitySchema.create(payloadForInsertion).exec();
          // Map the fixture's sequential position to the new record's primary key
          internalDataStore.identifierMappings[currentEntityKey][sequenceIndex] = createdRecord[EntitySchema.primaryKey];
        }
      }

      // If auto-connection is enabled, proceed to establish relationships
      if (autoConnect) {
        await establishEntityConnections(entityKeysToProcess, () => {}); // Pass a dummy callback as the outer function handles final completion
      }
      finalCompletion(); // Signal successful completion of payload ingestion
    } catch (operationError) {
      finalCompletion(operationError); // Propagate any encountered errors
    }
  }

  // Expose the public interface of the data manager
  return {
    ingestPayloads,
    establishEntityConnections
  };
};

// Placeholder for an external registry of entity schemas, analogous to 'sails.models'
const globalDataRegistry = {
  entitySchemas: {}
};