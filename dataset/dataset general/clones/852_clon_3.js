var rootContext = {}; // Initializing a global context object

// Attempt to establish the root context, falling back if 'window' is unavailable.
// This block ensures a consistent environment for 'rootContext' and 'exports'.
if (typeof window === 'object' && window !== null) {
  rootContext = window;
} else if (typeof global === 'object' && global !== null) { // For Node.js or similar environments
  rootContext = global;
  if (typeof exports === 'object' && exports !== null && !exports.console) {
    exports.console = console; // Ensure console is available if in Node.js and not already set
  }
} else {
  // Fallback for very restrictive environments or web workers
  console.warn("No 'window' or 'global' object found. Using a bare object as rootContext.");
}

// Initialize the core data management system, or use an existing one.
// The primary data access object is now 'entityMgr'.
var entityMgr = (rootContext && rootContext.entityMgr) ? rootContext.entityMgr : {};

// Ensure the 'data' submodule exists within 'entityMgr'.
if (!entityMgr.data) {
  entityMgr.data = {};
}

// Establish the relational database (SQL) specific component.
entityMgr.data.relational = {};

// Configuration function for the SQL adapter.
entityMgr.data.relational.configureAdapter = function(dataManagementSystem, sqlAdapter) {
  // Retrieve the argument specification utility from the data management system.
  var paramSpec = dataManagementSystem.paramSpec;

  /**
   * Defines how data types are mapped between the entity model and the SQL database.
   * This object can be extended or overridden to support custom data types or storage options.
   */
  dataManagementSystem.typeConverter = {
    /**
     * The SQL data type used for unique entity identifiers.
     */
    identifierType: "VARCHAR(36)", // Changed from 32 to 36 for UUIDs if needed

    /**
     * The SQL data type for storing class or entity names, typically used in mixins or polymorphic relationships.
     */
    entityTypeName: "TEXT",

    /**
     * Provides the SQL column definition string for a given entity field type.
     * @param {string} type - The logical type of the field (e.g., 'JSON', 'BOOL', 'DATE').
     * @returns {string} The corresponding SQL data type string.
     */
    getSqlColumnDef: function(type) {
      // Using if/else if for variety instead of switch
      if (type === 'JSON') {
        return 'TEXT';
      } else if (type === 'BOOL') {
        return 'INTEGER'; // Using INTEGER for boolean (0/1)
      } else if (type === 'DATE') {
        return 'BIGINT'; // Storing DATE as BIGINT (milliseconds timestamp)
      } else if (type === 'FLOAT') { // Added FLOAT type
        return 'REAL';
      } else {
        return type; // Default to the type name itself
      }
    },

    /**
     * Formats an input variable for use in a SQL query.
     * @param {string} inputVar - The variable placeholder (e.g., '?').
     * @param {string} type - The logical type of the variable.
     * @returns {string} The formatted input variable string.
     */
    formatInputVar: function(inputVar, type) {
      // Could add type-specific formatting here if needed, but keeping simple for now.
      return inputVar;
    },

    /**
     * Formats an output variable (e.g., a literal value) for direct inclusion in a SQL query.
     * @param {string} outputVal - The value to format.
     * @param {string} type - The logical type of the value.
     * @returns {string} The formatted output value string.
     */
    formatOutputVar: function(outputVal, type) {
      // Example: if type is 'TEXT' and outputVal is not a placeholder, quote it.
      // For now, assuming outputVal is already properly escaped or is a placeholder.
      return outputVal;
    },

    /**
     * Formats an identifier (ID) value for direct inclusion in a SQL query.
     * @param {string} idValue - The identifier value.
     * @returns {string} The formatted identifier string, typically quoted.
     */
    formatOutputId: function(idValue) {
      // Using template literals for string construction.
      return `'${idValue}'`;
    },

    /**
     * Converts a value retrieved from the database into a format suitable for the entity model.
     * Performs necessary type conversions.
     * @param {*} databaseValue - The value from the database.
     * @param {string} fieldType - The logical type of the entity field.
     * @returns {*} The converted value for the entity.
     */
    convertDbToEntityValue: function(databaseValue, fieldType) {
      if (databaseValue === null || typeof databaseValue === 'undefined') {
        return databaseValue;
      }

      switch (fieldType) {
        case 'DATE':
          // SQL might store seconds or milliseconds. Assuming milliseconds for BIGINT.
          // Original was `parseInt(val, 10) * 1000` which implies seconds from DB.
          // If stored as BIGINT (milliseconds), just use new Date().
          // Let's assume it's stored as seconds for backward compatibility with original code's logic.
          const dateVal = parseInt(databaseValue, 10);
          if (isNaN(dateVal)) {
            console.warn(`Invalid DATE value from DB: ${databaseValue}`);
            return null;
          }
          return new Date(dateVal * 1000); // Convert seconds to milliseconds
        case 'BOOL':
          // Convert various truthy/falsy DB values to strict boolean
          return databaseValue === 1 || databaseValue === '1' || databaseValue === true;
        case 'INT':
        case 'BIGINT':
          // Convert to number explicitly
          const numVal = Number(databaseValue);
          return isNaN(numVal) ? null : numVal;
        case 'JSON':
          try {
            return databaseValue ? JSON.parse(databaseValue) : null;
          } catch (error) {
            console.error(`Failed to parse JSON from DB: ${databaseValue}`, error);
            return null; // Return null on parsing error
          }
        case 'FLOAT': // Handle new FLOAT type
          const floatVal = parseFloat(databaseValue);
          return isNaN(floatVal) ? null : floatVal;
        default:
          return databaseValue; // Return as is for other types
      }
    },

    /**
     * Converts an entity value into a format suitable for storage in the database.
     * Inverse of convertDbToEntityValue.
     * @param {*} entityValue - The value from the entity model.
     * @param {string} fieldType - The logical type of the entity field.
     * @returns {*} The converted value for the database.
     */
    convertEntityToDbValue: function(entityValue, fieldType) {
      // Early exit for null or undefined values.
      if (entityValue === undefined || entityValue === null) {
        return null;
      }

      // Using an extended if-else if chain.
      if (fieldType === 'JSON') {
        // Ensure non-null objects are stringified.
        return entityValue ? JSON.stringify(entityValue) : null;
      } else if (entityValue && typeof entityValue === 'object' && 'id' in entityValue) {
        // If it's an object with an 'id' property, assume it's a related entity and store its ID.
        return entityValue.id;
      } else if (fieldType === 'BOOL') {
        // Convert to 0 or 1 for boolean storage.
        return (entityValue === false || entityValue === 'false' || !entityValue) ? 0 : 1;
      } else if (fieldType === 'DATE' || (entityValue instanceof Date && typeof entityValue.getTime === 'function')) {
        // Convert Date objects to Unix timestamp (seconds) for database storage.
        // This makes it compatible with SQLite's date functions.
        const dateObject = (entityValue instanceof Date) ? entityValue : new Date(entityValue);
        return Math.round(dateObject.getTime() / 1000); // Convert milliseconds to seconds
      } else if (fieldType === 'FLOAT') { // Handle new FLOAT type
        const floatVal = parseFloat(entityValue);
        return isNaN(floatVal) ? null : floatVal;
      } else {
        return entityValue; // Return as is for other types.
      }
    },

    /**
     * Shortcut for formatInputVar specifically for identifier types.
     * @param {string} inputStr - The input string.
     * @returns {string} Formatted identifier input string.
     */
    formatInputIdentifier: function(inputStr) {
      return this.formatInputVar(inputStr, this.identifierType);
    },

    /**
     * Shortcut for formatOutputVar specifically for identifier types.
     * @param {string} outputStr - The output string.
     * @returns {string} Formatted identifier output string.
     */
    formatOutputIdentifier: function(outputStr) {
      return this.formatOutputVar(outputStr, this.identifierType);
    },

    /**
     * Shortcut for convertEntityToDbValue for identifier types.
     * @param {*} entityId - The entity ID.
     * @returns {*} Converted database ID value.
     */
    convertEntityIdToDbId: function(entityId) {
      return this.convertEntityToDbValue(entityId, this.identifierType);
    }
  };

  // A registry for tables that have been generated or are expected to exist in the schema.
  dataManagementSystem.trackedSchemaItems = {}; // Now a simple object acting as a set

  /**
   * Synchronizes the entity model with the database schema, creating missing tables and indexes.
   *
   * @param {object} transactionHandle - The active database transaction object (optional).
   * @param {function} onCompletion - Callback function to execute upon completion, receives the transaction.
   * @param {boolean} simulateOnly - If true, only simulates the schema generation without executing DDL.
   */
  dataManagementSystem.synchronizeSchema = function(transactionHandle, onCompletion, simulateOnly) {
    // Parse arguments using the utility.
    const parsedArgs = paramSpec.getArgs(arguments, [
      { name: "transactionHandle", optional: true, check: dataManagementSystem.isTransaction, defaultValue: null },
      { name: "onCompletion", optional: true, check: paramSpec.isCallback(), defaultValue: () => {} },
      { name: "simulateOnly", optional: true, check: paramSpec.hasType('boolean'), defaultValue: false }
    ]);

    transactionHandle = parsedArgs.transactionHandle;
    onCompletion = parsedArgs.onCompletion;
    simulateOnly = parsedArgs.simulateOnly;

    // If no transaction is provided, start a new one and re-call this function.
    if (!transactionHandle) {
      const currentSession = this;
      this.transaction(function(tx) {
        currentSession.synchronizeSchema(tx, onCompletion, simulateOnly);
      });
      return;
    }

    const sqlCommandList = []; // Array to store [SQL_STRING, ARGS_ARRAY] tuples
    const typeMap = dataManagementSystem.typeConverter;
    const allEntityMeta = dataManagementSystem.getEntityMeta();

    // Iterate through all defined entities to generate DDL statements.
    for (const currentEntityName in allEntityMeta) {
      if (!Object.prototype.hasOwnProperty.call(allEntityMeta, currentEntityName)) {
        continue;
      }

      const entityMetadata = allEntityMeta[currentEntityName];
      // Skip mixins as they don't have their own tables.
      if (entityMetadata.isMixin) {
        continue;
      }

      const columnDefinitions = [];
      // Add primary key definition first.
      columnDefinitions.push(["id", typeMap.identifierType, "PRIMARY KEY"]);

      // Process regular fields.
      for (const propertyKey in entityMetadata.fields) {
        if (Object.prototype.hasOwnProperty.call(entityMetadata.fields, propertyKey)) {
          columnDefinitions.push([propertyKey, typeMap.getSqlColumnDef(entityMetadata.fields[propertyKey])]);
        }
      }

      // Process 'hasOne' relationships (foreign keys).
      for (const relationshipName in entityMetadata.hasOne) {
        if (Object.prototype.hasOwnProperty.call(entityMetadata.hasOne, relationshipName)) {
          // Add a column for the foreign key, using the identifier type.
          columnDefinitions.push([relationshipName, typeMap.identifierType]);
          // Add an index for the foreign key column for performance.
          sqlCommandList.push([sqlAdapter.createIndex(entityMetadata.name, [relationshipName]), []]);
        }
      }

      // Process custom indexes defined on the entity.
      for (let i = 0; i < entityMetadata.indexes.length; i++) {
        const indexDef = entityMetadata.indexes[i];
        sqlCommandList.push([sqlAdapter.createIndex(entityMetadata.name, indexDef.columns, indexDef), []]);
      }

      // Create the table for the current entity.
      sqlCommandList.push([sqlAdapter.createTable(entityMetadata.name, columnDefinitions), []]);
      dataManagementSystem.trackedSchemaItems[entityMetadata.name] = true; // Mark as tracked

      // Process 'hasMany' relationships, especially many-to-many.
      for (const relationshipName in entityMetadata.hasMany) {
        if (Object.prototype.hasOwnProperty.call(entityMetadata.hasMany, relationshipName) && entityMetadata.hasMany[relationshipName].manyToMany) {
          const linkedTableName = entityMetadata.hasMany[relationshipName].tableName;
          // Only create the join table if it hasn't been generated yet.
          if (!dataManagementSystem.trackedSchemaItems[linkedTableName]) {
            const relatedEntityMeta = entityMetadata.hasMany[relationshipName].type.meta;
            const inverseRelationship = entityMetadata.hasMany[relationshipName].inverseProperty;

            // Ensure the inverse relationship is valid before proceeding for many-to-many.
            if (!relatedEntityMeta.hasMany || !relatedEntityMeta.hasMany[inverseRelationship] || relatedEntityMeta.hasMany[inverseRelationship].type.meta !== entityMetadata) {
              console.warn(`Skipping mtm table creation for ${linkedTableName}: Inverse relationship not found or mismatched.`);
              continue;
            }

            const fk1 = entityMetadata.name + "_" + relationshipName;
            const fk2 = relatedEntityMeta.name + "_" + inverseRelationship;
            const tableColumns = [
              [fk1, typeMap.identifierType],
              [fk2, typeMap.identifierType]
            ];

            // Add class name columns if either side of the relationship is a mixin.
            if (entityMetadata.isMixin) {
              tableColumns.push([fk1 + "_class", typeMap.entityTypeName]);
            }
            if (relatedEntityMeta.isMixin) {
              tableColumns.push([fk2 + "_class", typeMap.entityTypeName]);
            }

            sqlCommandList.push([sqlAdapter.createTable(linkedTableName, tableColumns), []]);
            sqlCommandList.push([sqlAdapter.createIndex(linkedTableName, [fk1]), []]);
            sqlCommandList.push([sqlAdapter.createIndex(linkedTableName, [fk2]), []]);
            dataManagementSystem.trackedSchemaItems[linkedTableName] = true; // Mark as tracked
          }
        }
      }
    }

    // Execute schema synchronization hooks.
    const hookFunctions = dataManagementSystem.schemaSyncHooks || [];
    for (const hook of hookFunctions) {
      hook(transactionHandle);
    }

    // If simulating, just call the callback. Otherwise, execute the queries.
    if (simulateOnly) {
      console.log(`Schema synchronization simulated. ${sqlCommandList.length} DDL commands would have been executed.`);
      onCompletion(transactionHandle);
    } else {
      runSqlCommandsSequentially(transactionHandle, sqlCommandList, function() {
        console.log(`Schema synchronization completed. ${sqlCommandList.length} DDL commands executed.`);
        onCompletion(transactionHandle);
      });
    }
  };

  /**
   * Persists all pending changes (new, updated, deleted entities) to the database within a transaction.
   *
   * @param {object} transactionHandle - The active database transaction object (optional).
   * @param {function} onCompletion - Callback function to execute upon completion.
   */
  dataManagementSystem.persistChanges = function(transactionHandle, onCompletion) {
    const parsedArgs = paramSpec.getArgs(arguments, [
      { name: "transactionHandle", optional: true, check: dataManagementSystem.isTransaction, defaultValue: null },
      { name: "onCompletion", optional: true, check: paramSpec.isCallback(), defaultValue: () => {} }
    ]);
    transactionHandle = parsedArgs.transactionHandle;
    onCompletion = parsedArgs.onCompletion;

    const currentSession = this;
    // If no transaction, initiate one and retry.
    if (!transactionHandle) {
      this.transaction(function(tx) {
        currentSession.persistChanges(tx, onCompletion);
      });
      return;
    }

    // Execute flush hooks.
    const hookFunctions = dataManagementSystem.flushHooks || [];
    for (const hook of hookFunctions) {
      hook(currentSession, transactionHandle);
    }

    // Prepare lists of entities to be saved and deleted.
    const entitiesToSave = [];
    for (const objectId in currentSession.managedEntities) {
      if (Object.prototype.hasOwnProperty.call(currentSession.managedEntities, objectId)) {
        entitiesToSave.push(currentSession.managedEntities[objectId]);
      }
    }

    const entitiesToDelete = [];
    for (const objectId in currentSession.pendingDeletions) {
      if (Object.prototype.hasOwnProperty.call(currentSession.pendingDeletions, objectId)) {
        entitiesToDelete.push(currentSession.pendingDeletions[objectId]);
        // Stop tracking deleted objects immediately.
        delete currentSession.managedEntities[objectId];
      }
    }
    currentSession.pendingDeletions = {}; // Clear pending deletions

    const totalChanges = entitiesToSave.length + entitiesToDelete.length;
    if (totalChanges === 0) {
      console.log("No pending changes to persist.");
      return onCompletion();
    }

    console.log(`Persisting ${entitiesToSave.length} entities and deleting ${entitiesToDelete.length} entities.`);

    // Use asynchronous parallel processing for deletions, then for saves.
    // This assumes `dataManagementSystem.asyncParForEach` is available.
    dataManagementSystem.asyncParForEach(entitiesToDelete, function(entityObject, deleteCallback) {
      deleteEntity(entityObject, transactionHandle, deleteCallback);
    }, function() {
      dataManagementSystem.asyncParForEach(entitiesToSave, function(entityObject, saveCallback) {
        storeEntity(entityObject, transactionHandle, saveCallback);
      }, onCompletion);
    });
  };

  /**
   * Removes all tables defined by the current entity model from the database.
   *
   * @param {object} transactionHandle - The active database transaction object (optional).
   * @param {function} onCompletion - Callback function to execute upon completion.
   */
  dataManagementSystem.clearDatabase = function(transactionHandle, onCompletion) {
    const parsedArgs = paramSpec.getArgs(arguments, [
      { name: "transactionHandle", optional: true, check: dataManagementSystem.isTransaction, defaultValue: null },
      { name: "onCompletion", optional: true, check: paramSpec.isCallback(), defaultValue: () => {} }
    ]);
    transactionHandle = parsedArgs.transactionHandle;
    onCompletion = parsedArgs.onCompletion;

    const currentSession = this;
    if (!transactionHandle) {
      currentSession.transaction(function(tx) {
        currentSession.clearDatabase(tx, onCompletion);
      });
      return;
    }

    // First, simulate schema synchronization to gather the names of all generated tables.
    this.synchronizeSchema(transactionHandle, function() {
      const schemaElementList = Object.keys(dataManagementSystem.trackedSchemaItems);
      console.log(`Preparing to drop ${schemaElementList.length} tables.`);

      // Helper function to drop tables sequentially.
      function dropNextTable() {
        if (schemaElementList.length === 0) {
          finalCleanupAndCallback();
          return;
        }
        const tableNameToDrop = schemaElementList.pop(); // Get table name from the end
        const dropStatement = `DROP TABLE IF EXISTS "${tableNameToDrop}"`; // Use double quotes for table names

        transactionHandle.executeSql(dropStatement, [], function() {
          console.debug(`Dropped table: ${tableNameToDrop}`);
          dropNextTable(); // Recursively call for the next table
        }, function(_, error) {
          console.error(`Error dropping table ${tableNameToDrop}: ${error.message}`);
          dropNextTable(); // Continue even if one drop fails
        });
      }

      function finalCleanupAndCallback() {
        currentSession.clean(); // Clean up session state
        dataManagementSystem.trackedSchemaItems = {}; // Reset tracked schema items
        console.log("Database reset complete.");
        onCompletion();
      }

      if (schemaElementList.length > 0) {
        dropNextTable();
      } else {
        console.log("No tables found to drop.");
        finalCleanupAndCallback();
      }
    }, true); // `true` for simulateOnly
  };

  /**
   * Converts a database row (record) into an entity instance.
   * @param {object} session - The current persistence session.
   * @param {string} entityTypeName - The name of the entity type.
   * @param {object} dbRecord - The database row object.
   * @param {string} [columnPrefix=''] - Optional prefix for column names in the row.
   * @returns {object|null} The hydrated entity instance, or null if no ID found.
   */
  function mapDbRowToInstance(session, entityTypeName, dbRecord, columnPrefix = '') {
    // If the database record itself is null or undefined, return null.
    if (!dbRecord) {
      return null;
    }

    const typeMap = dataManagementSystem.typeConverter;
    const entityIdColumn = columnPrefix + 'id';
    const recordIdentifier = dbRecord[entityIdColumn];

    // Check if the entity is already tracked (cached).
    if (session.managedEntities[recordIdentifier]) {
      return session.managedEntities[recordIdentifier];
    }

    // If no ID is present, it's not a valid entity instance from the row.
    if (!recordIdentifier) {
      return null;
    }

    const entityMetadata = dataManagementSystem.getMeta(entityTypeName);
    const entityConstructor = dataManagementSystem.define(entityTypeName); // Get the constructor for the entity

    const entityInstance = new entityConstructor();
    entityInstance.id = typeMap.convertDbToEntityValue(recordIdentifier, typeMap.identifierType);
    entityInstance._isNew = false; // Mark as an existing entity

    // Populate entity data from the database record.
    for (const dbColumnName in dbRecord) {
      if (Object.prototype.hasOwnProperty.call(dbRecord, dbColumnName)) {
        // Check if the column name starts with the expected prefix.
        if (dbColumnName.startsWith(columnPrefix)) {
          const fieldName = dbColumnName.substring(columnPrefix.length);
          if (fieldName !== 'id') { // Skip the 'id' as it's already handled
            const fieldType = entityMetadata.fields[fieldName] || typeMap.identifierType; // Fallback to ID type for relations
            entityInstance._internalData[fieldName] = typeMap.convertDbToEntityValue(dbRecord[dbColumnName], fieldType);
          }
        }
      }
    }
    // Add to session's tracked entities
    session.managedEntities[entityInstance.id] = entityInstance;
    return entityInstance;
  }

  /**
   * Internal function to persist (insert or update) an entity object to the database.
   * This function is invoked by dataManagementSystem.persistChanges().
   * @param {object} entityObject - The entity instance to save.
   * @param {object} transactionHandle - The active database transaction.
   * @param {function} [onCompletion] - Callback function to execute after save operation.
   */
  function storeEntity(entityObject, transactionHandle, onCompletion) {
    if (!entityObject || !entityObject._type) {
      console.error("Attempted to store an invalid entity object.");
      if (onCompletion) onCompletion();
      return;
    }

    const entityMetadata = dataManagementSystem.getMeta(entityObject._type);
    const typeMap = dataManagementSystem.typeConverter;
    const fieldNames = [];
    const fieldValues = [];
    const placeholderStrings = []; // For INSERT
    const updateAssignments = []; // For UPDATE

    // Mark all properties as dirty if it's a new entity.
    if (entityObject._isNew) {
      for (const p in entityMetadata.fields) {
        if (Object.prototype.hasOwnProperty.call(entityMetadata.fields, p)) {
          entityObject._modifiedFields[p] = true;
        }
      }
    }

    // Collect dirty properties for SQL statement generation.
    for (const p in entityObject._modifiedFields) {
      if (Object.prototype.hasOwnProperty.call(entityObject._modifiedFields, p)) {
        fieldNames.push(`"${p}"`); // Quote field names
        const fieldType = entityMetadata.fields[p] || typeMap.identifierType;
        const dbValue = typeMap.convertEntityToDbValue(entityObject._internalData[p], fieldType);
        fieldValues.push(dbValue);
        placeholderStrings.push(typeMap.formatOutputVar("?", fieldType));
        updateAssignments.push(`"${p}" = ${typeMap.formatOutputVar("?", fieldType)}`);
      }
    }

    const relationshipCommands = [];
    // Collect commands for many-to-many relationships.
    for (const p in entityMetadata.hasMany) {
      if (Object.prototype.hasOwnProperty.call(entityMetadata.hasMany, p)) {
        const queryCollection = dataManagementSystem.get(entityObject, p);
        if (typeof queryCollection.generatePersistenceCommands === 'function') {
          relationshipCommands.push(...queryCollection.generatePersistenceCommands());
        }
      }
    }

    // Execute relationship commands first, then the main entity save.
    runSqlCommandsSequentially(transactionHandle, relationshipCommands, function() {
      // If no fields changed and it's not a new entity, nothing to do for the main entity.
      if (fieldNames.length === 0 && !entityObject._isNew) {
        console.debug(`No changes detected for entity ${entityObject._type} with ID ${entityObject.id}.`);
        if (onCompletion) onCompletion();
        return;
      }

      entityObject._modifiedFields = {}; // Clear dirty flags
      let statementText;

      if (entityObject._isNew) {
        // For new entities, perform an INSERT.
        fieldNames.push('id');
        fieldValues.push(typeMap.convertEntityIdToDbId(entityObject.id));
        placeholderStrings.push(typeMap.formatOutputIdentifier('?'));
        statementText = `INSERT INTO "${entityObject._type}" (${fieldNames.join(", ")}) VALUES (${placeholderStrings.join(', ')})`;
        entityObject._isNew = false; // Entity is no longer new
        console.debug(`SQL INSERT: ${statementText} with values: ${JSON.stringify(fieldValues)}`);
        transactionHandle.executeSql(statementText, fieldValues, onCompletion);
      } else {
        // For existing entities, perform an UPDATE.
        statementText = `UPDATE "${entityObject._type}" SET ${updateAssignments.join(', ')} WHERE id = ${typeMap.formatOutputId(entityObject.id)}`;
        console.debug(`SQL UPDATE: ${statementText} with values: ${JSON.stringify(fieldValues)}`);
        transactionHandle.executeSql(statementText, fieldValues, onCompletion);
      }
    });
  }

  /**
   * Internal function to remove an entity object from the database.
   * This function is invoked by dataManagementSystem.persistChanges().
   * @param {object} entityObject - The entity instance to delete.
   * @param {object} transactionHandle - The active database transaction.
   * @param {function} [onCompletion] - Callback function to execute after delete operation.
   */
  function deleteEntity(entityObject, transactionHandle, onCompletion) {
    if (!entityObject || !entityObject._type || !entityObject.id) {
      console.error("Attempted to delete an invalid entity object.");
      if (onCompletion) onCompletion();
      return;
    }

    const entityMetadata = dataManagementSystem.getMeta(entityObject._type);
    const typeMap = dataManagementSystem.typeConverter;
    const sqlCommandList = [];

    // Delete the main entity record.
    const deleteMainEntitySql = `DELETE FROM "${entityObject._type}" WHERE id = ${typeMap.formatOutputId(entityObject.id)}`;
    sqlCommandList.push([deleteMainEntitySql, []]);
    console.debug(`SQL DELETE (main entity): ${deleteMainEntitySql}`);

    // If there are many-to-many relationships, delete entries from join tables.
    for (const relationshipName in entityMetadata.hasMany) {
      if (Object.prototype.hasOwnProperty.call(entityMetadata.hasMany, relationshipName) && entityMetadata.hasMany[relationshipName].manyToMany) {
        const linkedTableName = entityMetadata.hasMany[relationshipName].tableName;
        const foreignKeyColumn = entityMetadata.name + '_' + relationshipName;
        const deleteJoinTableSql = `DELETE FROM "${linkedTableName}" WHERE "${foreignKeyColumn}" = ${typeMap.formatOutputId(entityObject.id)}`;
        sqlCommandList.push([deleteJoinTableSql, []]);
        console.debug(`SQL DELETE (join table ${linkedTableName}): ${deleteJoinTableSql}`);
      }
    }

    runSqlCommandsSequentially(transactionHandle, sqlCommandList, onCompletion);
  }

  /**
   * Utility function to execute a series of SQL queries asynchronously and sequentially.
   * Each query is executed only after the previous one completes.
   * @param {object} transactionHandle - The transaction object to execute queries on.
   * @param {Array<Array<string|Array>>} commandPairs - An array of [SQL_STRING, ARGS_ARRAY] tuples.
   * @param {function} [completionCallback] - The function to call when all queries have been executed.
   * @param {...any} additionalArgs - Any additional arguments to pass to the completion callback.
   */
  function runSqlCommandsSequentially(transactionHandle, commandPairs, completionCallback, ...additionalArgs) {
    let currentIndex = 0;

    function executeNextCommand() {
      if (currentIndex >= commandPairs.length) {
        if (completionCallback) {
          completionCallback.apply(null, additionalArgs);
        }
        return;
      }

      const [statementText, statementArgs] = commandPairs[currentIndex];
      currentIndex++;

      try {
        transactionHandle.executeSql(statementText, statementArgs, function() {
          executeNextCommand(); // On success, execute the next command
        }, function(_, error) {
          console.error(`SQL command failed: ${statementText} with args ${JSON.stringify(statementArgs)}. Error: ${error.message}`);
          // Decide whether to continue or stop on error. For now, continue.
          executeNextCommand();
        });
      } catch (e) {
        console.error(`Error initiating SQL command: ${statementText}. Exception: ${e.message}`);
        executeNextCommand(); // Attempt to continue
      }
    }

    executeNextCommand(); // Start the sequence
  }

  // Expose the sequential query executor on the data management system.
  dataManagementSystem.runSqlCommandsSequentially = runSqlCommandsSequentially;

  /////////////////////////// QuerySet modifications for SQL environment ///////////////////////////

  /**
   * Function called during session flush, returns a list of SQL commands to execute
   * for persisting the state of the query collection (e.g., many-to-many link changes).
   * @returns {Array<Array<string|Array>>} An array of [SQL_STRING, ARGS_ARRAY] tuples.
   */
  dataManagementSystem.QuerySet.prototype.generatePersistenceCommands = function() {
    return [];
  };

  // Store the original clone method for chaining.
  const originalQuerySetClone = dataManagementSystem.QuerySet.prototype.clone;

  /**
   * Creates a deep copy of the current QuerySet instance.
   * @param {boolean} includeSubscribers - Whether to clone event subscribers.
   * @returns {object} A new QuerySet instance with copied state.
   */
  dataManagementSystem.QuerySet.prototype.duplicateQuerySet = function(includeSubscribers) {
    const duplicatedSet = originalQuerySetClone.call(this, includeSubscribers);
    // Copy SQL-specific internal properties.
    duplicatedSet._extraJoinClauses = this._extraJoinClauses.slice(0);
    duplicatedSet._extraWhereClauses = this._extraWhereClauses.slice(0);
    duplicatedSet._extraGroupByClauses = this._extraGroupByClauses.slice(0);
    duplicatedSet._multiManyAssocFetch = this._multiManyAssocFetch; // This might be an object, shallow copy is fine if it's immutable
    return duplicatedSet;
  };

  // Store the original initializer method for chaining.
  const originalQuerySetInitializer = dataManagementSystem.QuerySet.prototype.init;

  /**
   * Initializes a new QuerySet instance with its internal state.
   * @param {object} session - The persistence session this QuerySet belongs to.
   * @param {string} entityTypeName - The name of the entity type.
   * @param {function} constructorFunction - The constructor function for the entity.
   */
  dataManagementSystem.QuerySet.prototype.initializeQuerySet = function(session, entityTypeName, constructorFunction) {
    originalQuerySetInitializer.call(this, session, entityTypeName, constructorFunction);
    // Initialize SQL-specific internal properties.
    this._multiManyAssocFetch = null;
    this._extraJoinClauses = [];
    this._extraWhereClauses = [];
    this._extraGroupByClauses = [];
  };

  // Store the original method for unique string generation.
  const originalQuerySetIdentifier = dataManagementSystem.QuerySet.prototype.toUniqueString;

  /**
   * Generates a unique string representation of the QuerySet's current state.
   * This is typically used for caching query results.
   * @returns {string} A unique string identifier for the QuerySet.
   */
  dataManagementSystem.QuerySet.prototype.getUniqueQuerySetKey = function() {
    let keyString = originalQuerySetIdentifier.call(this);
    keyString += '|Joins:';
    for (let i = 0; i < this._extraJoinClauses.length; i++) {
      keyString += this._extraJoinClauses[i];
    }
    keyString += '|Wheres:';
    // The original code was truncated here. Assuming it would iterate _additionalWhereSqls.
    // Let's add a placeholder for more complete implementation.
    for (let i = 0; i < this._extraWhereClauses.length; i++) {
      keyString += this._extraWhereClauses[i];
    }
    keyString += '|GroupBys:';
    for (let i = 0; i < this._extraGroupByClauses.length; i++) {
      keyString += this._extraGroupByClauses[i];
    }
    if (this._multiManyAssocFetch) {
      keyString += `|ManyManyFetch:${JSON.stringify(this._multiManyAssocFetch)}`;
    }
    return keyString;
  };

  // A new helper function for logging SQL statements if a debug flag is set
  // This is an example of adding a new fragment for enhanced functionality
  dataManagementSystem.logSqlStatement = function(sql, params) {
    if (dataManagementSystem.debugMode === true) {
      console.log(`[SQL DEBUG] ${sql} -- Parameters: ${JSON.stringify(params)}`);
    }
  };
};