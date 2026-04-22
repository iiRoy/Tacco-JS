'use strict';

/**
 * Data Loader Module: Facilitates the loading and injection of predefined data sets into the system.
 * This utility is designed for setting up test environments or initial data states.
 */

/**
 * Required external libraries
 */
const fileSystem = require('fs');
const pathResolver = require('path');
const asynchronous = require('async');
const utilityBelt = require('lodash');

module.exports = DataSetInjector;

/**
 * DataSetInjector Constructor
 * Initializes the data loader with a specified source directory.
 * @param {string} sourceDirectoryPath - The path to the directory containing JSON fixture files.
 *                                     Defaults to <current working directory>/test/fixtures.
 */
function DataSetInjector(sourceDirectoryPath) {
  // Ensure the constructor is called with 'new'
  if (!(this instanceof DataSetInjector)) {
    return new DataSetInjector(sourceDirectoryPath);
  }

  // Storage for raw data parsed from JSON files, keyed by entity name.
  this.rawDataSet = {};

  // Mapping of fixture item positions to actual database primary keys.
  this.primaryKeyLookup = {};

  // Definitions of relationships between entities.
  this.relationshipDefinitions = {};

  // Resolve the path for fixture files.
  const resolvedSourcePath = sourceDirectoryPath || pathResolver.join(process.cwd(), 'test', 'fixtures');

  // Validate directory existence early.
  if (!fileSystem.existsSync(resolvedSourcePath) || !fileSystem.lstatSync(resolvedSourcePath).isDirectory()) {
    console.warn(`[DataSetInjector] Warning: Source directory not found or not a directory: ${resolvedSourcePath}`);
    // Initialize empty to prevent further errors if directory is missing
    this.availableEntities = [];
    return;
  }

  // Read all files in the source directory.
  const directoryContents = fileSystem.readdirSync(resolvedSourcePath);

  // Process only JSON files to load data.
  directoryContents
    .filter(fileName => pathResolver.extname(fileName).toLowerCase() === '.json')
    .forEach(jsonFile => {
      const entityKey = pathResolver.basename(jsonFile, '.json').toLowerCase();
      try {
        const fullFilePath = pathResolver.join(resolvedSourcePath, jsonFile);
        this.rawDataSet[entityKey] = require(fullFilePath);
        // Optional: Perform a basic validation on loaded data structure
        if (!Array.isArray(this.rawDataSet[entityKey])) {
          console.error(`[DataSetInjector] Error: Fixture file ${jsonFile} does not contain an array. Skipping.`);
          delete this.rawDataSet[entityKey];
        }
      } catch (loadErr) {
        console.error(`[DataSetInjector] Failed to load or parse JSON for ${jsonFile}:`, loadErr.message);
        delete this.rawDataSet[entityKey]; // Remove partially loaded or erroneous data
      }
    });

  // Keep track of all entity keys that have loaded data.
  this.availableEntities = Object.keys(this.rawDataSet);
}

/**
 * Establishes relationships between loaded entities based on their definitions.
 * This method should be called after entities have been populated into the database.
 * @param {string[]|function} targetEntityNames - Optional array of entity names to process. If omitted, all available entities are used.
 * @param {function} completionCallback - Callback function to execute upon completion or error.
 */
DataSetInjector.prototype.linkReferences = function(targetEntityNames, completionCallback) {
  // Handle overloaded arguments: If first argument is a function, it's the callback.
  if (!utilityBelt.isArray(targetEntityNames)) {
    completionCallback = targetEntityNames;
    targetEntityNames = this.availableEntities;
  }

  // Ensure a valid array of target entities, falling back to all if necessary.
  const entitiesToProcess = utilityBelt.isEmpty(targetEntityNames) ? this.availableEntities : targetEntityNames;
  if (utilityBelt.isEmpty(entitiesToProcess)) {
    return completionCallback(new Error('No entities specified or available for relationship linking.'));
  }

  const instanceRef = this; // Capture 'this' for use in nested callbacks.

  // Iterate through each entity to establish its relationships.
  asynchronous.each(entitiesToProcess, function(entityKey, continueEntityProcessing) {
    const EntitySchema = sails.models[entityKey];

    // Skip if the entity schema is not found in Sails.
    if (!EntitySchema) {
      console.warn(`[DataSetInjector] Entity schema '${entityKey}' not found in Sails. Skipping relationship linking.`);
      return continueEntityProcessing();
    }

    // Retrieve the raw fixture records for the current entity.
    const entityRecords = utilityBelt.cloneDeep(instanceRef.rawDataSet[entityKey]);

    // Process each record to update its relationships.
    asynchronous.each(entityRecords, function(recordItem, continueRecordIteration) {
      // Determine the position of the current record in its original fixture file.
      const recordPosition = entityRecords.indexOf(recordItem);
      if (recordPosition === -1) { // Should not happen if `indexOf` is used correctly.
        return continueRecordIteration(new Error(`Record not found in its own collection during association for ${entityKey}.`));
      }

      // Find the existing entity in the database using its primary key from the lookup map.
      EntitySchema.findOne(instanceRef.primaryKeyLookup[entityKey][recordPosition]).exec(function(dbFindError, persistedEntity) {
        if (dbFindError) {
          return continueRecordIteration(dbFindError);
        }
        if (!persistedEntity) {
          console.warn(`[DataSetInjector] Persisted entity not found for ${entityKey} at index ${recordPosition}. Skipping association for this record.`);
          return continueRecordIteration();
        }

        // Filter the record item to only include relationship attributes.
        const relationshipAttributes = utilityBelt.pick(recordItem, Object.keys(instanceRef.relationshipDefinitions[entityKey] || {}));

        // Iterate over each relationship attribute in the filtered record.
        asynchronous.each(Object.keys(relationshipAttributes), function(attributeName, proceedAttribute) {
          const relationshipDetail = instanceRef.relationshipDefinitions[entityKey][attributeName];
          if (!relationshipDetail) {
            console.warn(`[DataSetInjector] Relationship detail missing for attribute '${attributeName}' on entity '${entityKey}'. Skipping.`);
            return proceedAttribute();
          }

          const linkedEntityKey = relationshipDetail[relationshipDetail.type]; // e.g., 'model' or 'collection' value.
          const attributeValue = relationshipAttributes[attributeName];

          // Handle single association vs. collection association.
          if (!utilityBelt.isArray(attributeValue)) {
            // For 'belongsTo' or 'hasOne' relationships.
            // Adjust for 1-based indexing often used in fixture IDs.
            const targetId = instanceRef.primaryKeyLookup[linkedEntityKey][attributeValue - 1];
            if (targetId) {
              persistedEntity[attributeName] = targetId;
            } else {
              console.warn(`[DataSetInjector] Target ID for single association '${attributeName}' on '${entityKey}' not found. Fixture value: ${attributeValue}.`);
            }
          } else {
            // For 'hasMany' or 'manyToMany' relationships.
            // Iterate and add each associated ID.
            attributeValue.forEach(fixtureIdIndex => {
              const targetId = instanceRef.primaryKeyLookup[linkedEntityKey][fixtureIdIndex - 1];
              if (targetId) {
                // Assuming `add` method exists on the collection attribute.
                persistedEntity[attributeName].add(targetId);
              } else {
                console.warn(`[DataSetInjector] Target ID for collection association '${attributeName}' on '${entityKey}' not found. Fixture value: ${fixtureIdIndex}.`);
              }
            });
          }

          // Save the changes to the entity.
          persistedEntity.save(function(saveError) {
            if (saveError) {
              console.error(`[DataSetInjector] Error saving entity '${entityKey}' with relationships:`, saveError);
              return proceedAttribute(saveError);
            }
            proceedAttribute();
          });
        }, continueRecordIteration); // Callback for all attributes processed
      });
    }, continueEntityProcessing); // Callback for all records processed
  }, completionCallback); // Final callback for all entities processed
};

/**
 * Populates the database with fixture data, excluding associations initially.
 * @param {string[]|function} targetSets - Optional array of entity names to populate. Defaults to all available entities.
 * @param {function} completionHandler - Callback function to execute upon completion or error.
 * @param {boolean} autoConnect - Flag to automatically establish relationships after population. Defaults to true.
 */
DataSetInjector.prototype.injectRecords = function(targetSets, completionHandler, autoConnect) {
  // Argument reordering for flexibility.
  if (!utilityBelt.isArray(targetSets)) {
    autoConnect = completionHandler;
    completionHandler = targetSets;
    targetSets = this.availableEntities;
  } else {
    // Ensure entity names are consistently lowercase if provided.
    targetSets = targetSets.map(setName => setName.toLowerCase());
  }

  // Default `autoConnect` to true if not explicitly set to false.
  const shouldAutoConnect = !(autoConnect === false);
  const instanceRef = this;

  // Process each specified entity set.
  asynchronous.each(targetSets, function(entityKey, continueEntityProcessing) {
    const EntitySchema = sails.models[entityKey];

    // If the entity schema is not found, log a warning and skip.
    if (!EntitySchema) {
      console.warn(`[DataSetInjector] Entity schema '${entityKey}' not found in Sails. Skipping data injection.`);
      return continueEntityProcessing();
    }

    // Clear existing data in the current entity's collection to ensure a clean slate.
    EntitySchema.destroy().exec(function(destroyError) {
      if (destroyError) {
        console.error(`[DataSetInjector] Error clearing existing data for '${entityKey}':`, destroyError);
        return continueEntityProcessing(destroyError);
      }

      // Store association information from the EntitySchema.
      // This is crucial for later relationship linking.
      instanceRef.relationshipDefinitions[entityKey] = {};
      EntitySchema.associations.forEach(assoc => {
        instanceRef.relationshipDefinitions[entityKey][assoc.alias] = assoc;
      });

      // Initialize the ID map for the current entity.
      instanceRef.primaryKeyLookup[entityKey] = [];

      // Create a deep copy of the fixture data to avoid modifying the original `rawDataSet`.
      // Using JSON stringify/parse for a simple deep clone, suitable for plain data objects.
      const entityRecords = JSON.parse(JSON.stringify(instanceRef.rawDataSet[entityKey]));

      // Insert each fixture item into the database.
      asynchronous.each(entityRecords, function(recordItem, continueRecordIteration) {
        const recordPosition = entityRecords.indexOf(recordItem);

        // If auto-linking is enabled, remove association data from the item before creation.
        // Associations will be handled in a separate step.
        let dataToCreate = recordItem;
        if (shouldAutoConnect) {
          dataToCreate = utilityBelt.omit(recordItem, Object.keys(instanceRef.relationshipDefinitions[entityKey]));
        }

        // Create the entity record in the database.
        EntitySchema.create(dataToCreate).exec(function(createError, persistedEntity) {
          if (createError) {
            console.error(`[DataSetInjector] Error creating record for '${entityKey}':`, createError);
            return continueRecordIteration(createError);
          }
          if (!persistedEntity) {
            console.error(`[DataSetInjector] No entity returned after creation for '${entityKey}'.`);
            return continueRecordIteration(new Error('Created entity is null or undefined.'));
          }

          // Map the original fixture position to the newly generated primary key.
          const pkAttribute = EntitySchema.primaryKey || 'id'; // Fallback to 'id' if primaryKey is not defined.
          instanceRef.primaryKeyLookup[entityKey][recordPosition] = persistedEntity[pkAttribute];

          continueRecordIteration();
        });
      }, continueEntityProcessing); // Callback for all records in the current entity processed.
    });
  }, function(allEntitiesError) {
    if (allEntitiesError) {
      console.error('[DataSetInjector] Error during overall data injection process:', allEntitiesError);
      return completionHandler(allEntitiesError);
    }

    // If auto-linking is enabled, proceed to establish relationships.
    if (shouldAutoConnect) {
      console.log('[DataSetInjector] Data injection complete. Initiating relationship linking...');
      return instanceRef.linkReferences(targetSets, completionHandler);
    }

    // If no auto-linking, simply complete the operation.
    console.log('[DataSetInjector] Data injection complete (relationships skipped).');
    completionHandler();
  });
};