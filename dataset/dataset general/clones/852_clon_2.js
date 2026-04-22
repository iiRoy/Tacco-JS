try{
  if ( !globalScope ) {
    globalScope = { };
    // moduleExports.debugLog = debugLog; // Optional: Comment out or rephrase the original comment
  }
}
catch ( catchError ) {
  globalScope = { };
  moduleExports.debugLog = debugLog;
}

var dataStore = ( globalScope && globalScope.dataStore ) ? globalScope.dataStore : { };

if ( !dataStore.backend ) {
  dataStore.backend = { };
}

dataStore.backend.relationalDb = { };

dataStore.backend.relationalDb.setup = function (storageSystemInstance, sqlDialectProvider) {
  var argumentSchema = storageSystemInstance.argumentSchema;

  /*
   * Default schema converter. Developers can override this to support more data types or options.
   */
  storageSystemInstance.schemaConverter = {
    /*
     * Database type for unique entity keys.
     */
    keyIdentifierType: "TEXT(32)",

    /*
     * Database type for object classification names (utilized by mixins).
     */
    objectKindType: "TEXT",

    /*
     * Provides the appropriate SQL type for a given column definition.
     */
    fieldSchemaType: function (dataType) {
      switch (dataType) {
        case 'JSON': return 'TEXT';
        case 'BOOL': return 'INTEGER';
        case 'DATE': return 'INTEGER';
        default: return dataType;
      }
    },

    inputParam: function (inputString, dataType) {
      return inputString;
    },
    outputParam: function (inputString, dataType) {
      return inputString;
    },
    outputKey: function (inputString) {
      return "'" + inputString + "'";
    },
    /*
     * Transforms a value retrieved from the database into a format suitable for the application object.
     * (Also handles necessary type conversions).
     */
    dbValueToObjValue: function (sourceValue, dataType) {
      if (sourceValue === null || sourceValue === undefined) {
        return sourceValue;
      }
      switch (dataType) {
        case 'DATE':
          // SQL stores in seconds; JavaScript uses milliseconds.
          return new Date(parseInt(sourceValue, 10) * 1000);
        case 'BOOL':
          return sourceValue === 1 || sourceValue === '1';
          // Original code has no break here, maintaining fall-through.
        case 'INT':
          return +sourceValue;
          // Original code has no break here, maintaining fall-through.
        case 'BIGINT':
          return +sourceValue;
          // Original code has no break here, maintaining fall-through.
        case 'JSON':
          if (sourceValue) {
            return JSON.parse(sourceValue);
          } else {
            return sourceValue;
          }
          // Original code has no break here, maintaining fall-through.
        default:
          return sourceValue;
      }
    },

    /*
     * Converts an application object value into a database-compatible value,
     * the inverse operation of dbValueToObjValue.
     */
    objValueToDbValue: function (sourceValue, dataType) {
      if (sourceValue === undefined || sourceValue === null) {
        return null;
      } else if (dataType === 'JSON' && sourceValue) {
        return JSON.stringify(sourceValue);
      } else if (sourceValue.identifier) { // Assuming 'identifier' is the common key for linked objects
        return sourceValue.identifier;
      } else if (dataType === 'BOOL') {
        return (sourceValue === 'false') ? 0 : (sourceValue ? 1 : 0);
      } else if (dataType === 'DATE' || sourceValue.getTime) {
        // For proper SQLite Date/Time function compatibility, values are stored
        // in seconds, not milliseconds like JS Date.getTime().
        sourceValue = new Date(sourceValue);
        return Math.round(sourceValue.getTime() / 1000);
      } else {
        return sourceValue;
      }
    },
    /*
     * Shorthand for inputParam when the type is an identifier – no need to override.
     */
    inputKeyParam: function (inputString) {
      return this.inputParam(inputString, this.keyIdentifierType);
    },
    /*
     * Shorthand for outputParam when the type is an identifier – no need to override.
     */
    outputKeyParam: function (inputString) {
      return this.outputParam(inputString, this.keyIdentifierType);
    },
    /*
     * Shorthand for objValueToDbValue when the type is an identifier – no need to override.
     */
    objKeyToDbKey: function (identifier) {
      return this.objValueToDbValue(identifier, this.keyIdentifierType);
    }
  };

  storageSystemInstance.createdTables = { }; // Set of table names generated

  /*
   * Synchronizes the defined data model with the database, creating any tables
   * that have not been previously established.
   *
   * @param transactionObj
   *            The transaction object to be used (optional).
   * @param completionHandler
   *            A function to be called once synchronization is complete;
   *            it receives the active transaction as an argument.
   * @param simulate
   *            If true, only determines changes without applying them.
   */
  storageSystemInstance.syncSchema = function (transactionObj, completionHandler, simulate) {
    var inputArguments = argumentSchema.getArgs(arguments, [
        { name: "transactionObj", optional: true, check: storageSystemInstance.isTransaction, defaultValue: null },
        { name: "completionHandler", optional: true, check: argumentSchema.isCallback(), defaultValue: function() { } },
        { name: "simulate", optional: true, check: argumentSchema.hasType('boolean') }
      ]);
    transactionObj = inputArguments.transactionObj;
    completionHandler = inputArguments.completionHandler;
    simulate = inputArguments.simulate;

    if ( !transactionObj ) {
      var currentSession = this;
      this.transaction(function (tran) { currentSession.syncSchema(tran, completionHandler, simulate); });
      return;
    }
    var sqlCommands = [ ], entityMetadata, columnDefinitions, relatedMetadata, tableIdentifier;

    var typeConverter = storageSystemInstance.schemaConverter;
    var allObjectMetadata = storageSystemInstance.getAllObjectMetadata();
    for ( var objectTypeName in allObjectMetadata ) {
      if ( allObjectMetadata.hasOwnProperty(objectTypeName) ) {
        entityMetadata = allObjectMetadata[objectTypeName];
        if ( !entityMetadata.isMixedIn ) {
          columnDefinitions = [ ];
          for ( var propertyKey in entityMetadata.properties ) {
            if ( entityMetadata.properties.hasOwnProperty(propertyKey) ) {
              columnDefinitions.push([propertyKey, entityMetadata.properties[propertyKey]]);
            }
          }
          for ( var relationship in entityMetadata.hasSingle ) {
            if ( entityMetadata.hasSingle.hasOwnProperty(relationship) ) {
              relatedMetadata = entityMetadata.hasSingle[relationship].kind.meta;
              columnDefinitions.push([relationship, typeConverter.keyIdentifierType]);
              sqlCommands.push([sqlDialectProvider.buildIndex(entityMetadata.name, [relationship]), null]);
            }
          }
          for ( var k = 0; k < entityMetadata.indexConfigs.length; k++ ) {
            sqlCommands.push([sqlDialectProvider.buildIndex(entityMetadata.name, entityMetadata.indexConfigs[k].columnKeys, entityMetadata.indexConfigs[k]), null]);
          }
        }
        for ( var relationship in entityMetadata.hasMultiple ) {
          if ( entityMetadata.hasMultiple.hasOwnProperty(relationship) && entityMetadata.hasMultiple[relationship].multipleToMany ) {
            tableIdentifier = entityMetadata.hasMultiple[relationship].tableName;
            if ( !storageSystemInstance.createdTables[tableIdentifier] ) {
              var relatedMetadata = entityMetadata.hasMultiple[relationship].kind.meta;
              var oppositeProperty = entityMetadata.hasMultiple[relationship].oppositeProperty;
              // This check ensures mixin many-to-many tables are created with the mixin itself.
              // It might seem redundant as mixins are typically processed before their consuming entities,
              // but it serves as a safeguard.
              if ( relatedMetadata.hasMultiple[oppositeProperty].kind.meta !== entityMetadata )
                continue;
              var partOne = entityMetadata.name + "_" + relationship;
              var partTwo = relatedMetadata.name + "_" + oppositeProperty;
              sqlCommands.push([sqlDialectProvider.buildIndex(tableIdentifier, [partOne]), null]);
              sqlCommands.push([sqlDialectProvider.buildIndex(tableIdentifier, [partTwo]), null]);
              var tableColumns = [[partOne, typeConverter.keyIdentifierType], [partTwo, typeConverter.keyIdentifierType]];
              if ( entityMetadata.isMixedIn )
                tableColumns.push([partOne + "_kind", typeConverter.objectKindType]);
              if ( relatedMetadata.isMixedIn )
                tableColumns.push([partTwo + "_kind", typeConverter.objectKindType]);
              sqlCommands.push([sqlDialectProvider.constructTable(tableIdentifier, tableColumns), null]);
              storageSystemInstance.createdTables[tableIdentifier] = true;
            }
          }
        }
        if ( !entityMetadata.isMixedIn ) {
          columnDefinitions.push(["identifier", typeConverter.keyIdentifierType, "MAIN_KEY"]);
          storageSystemInstance.createdTables[entityMetadata.name] = true;
          sqlCommands.push([sqlDialectProvider.constructTable(entityMetadata.name, columnDefinitions), null]);
        }
      }
    }
    var hookFunctions = storageSystemInstance.schemaSyncListeners;
    for ( var k = 0; k < hookFunctions.length; k++ ) {
      hookFunctions[k](transactionObj);
    }
    if ( simulate ) {
      // Process completed.
      completionHandler(transactionObj);
    } else {
      runQueriesSequentially(transactionObj, sqlCommands, function () {
          completionHandler(transactionObj);
        });
    }
  };

  /*
   * Persists all modifications within the current database transaction.
   *
   * @param transactionHandle
   *            The transaction to be used.
   * @param doneCallback
   *            Function to be invoked upon completion.
   */
  storageSystemInstance.commitChanges = function (transactionHandle, doneCallback) {
    var inputParams = argumentSchema.getArgs(arguments, [
        { name: "transactionHandle", optional: true, check: storageSystemInstance.isTransaction },
        { name: "doneCallback", optional: true, check: argumentSchema.isCallback(), defaultValue: null }
      ]);
    transactionHandle = inputParams.transactionHandle;
    doneCallback = inputParams.doneCallback;

    var currentScope = this;
    if ( !transactionHandle ) {
      this.transaction(function (tran) { currentScope.commitChanges(tran, doneCallback); });
      return;
    }
    var handlerFunctions = storageSystemInstance.commitListeners;
    for ( var k = 0; k < handlerFunctions.length; k++ ) {
      handlerFunctions[k](currentScope, transactionHandle);
    }

    var objectsToPersist = [ ];
    for ( var identifier in currentScope.monitoredObjects ) {
      if ( currentScope.monitoredObjects.hasOwnProperty(identifier) ) {
        objectsToPersist.push(currentScope.monitoredObjects[identifier]);
      }
    }
    var objectsToDelete = [ ];
    for ( var identifier in currentScope.pendingRemovals ) {
      if ( currentScope.pendingRemovals.hasOwnProperty(identifier) ) {
        objectsToDelete.push(currentScope.pendingRemovals[identifier]);
        delete currentScope.monitoredObjects[identifier]; // Stop monitoring this object
      }
    }
    currentScope.pendingRemovals = { };
    if ( doneCallback ) {
      storageSystemInstance.asyncParallelIterator(objectsToDelete, function (entityItem, iterCallback) {
          deleteRecord(entityItem, transactionHandle, iterCallback);
        }, function () {
          storageSystemInstance.asyncParallelIterator(objectsToPersist, function (entityItem, iterCallback) {
              storeRecord(entityItem, transactionHandle, iterCallback);
            }, doneCallback);
        });
    } else { // Optimized path for no callback
      for ( var k = 0; k < objectsToPersist.length; k++ ) {
        storeRecord(objectsToPersist[k], transactionHandle);
      }
      for ( var k = 0; k < objectsToDelete.length; k++ ) {
        deleteRecord(objectsToDelete[k], transactionHandle);
      }
    }
  };

  /*
   * Removes all tables in the database (as defined by the model).
   */
  storageSystemInstance.clearDatabase = function (transactionObject, completionFunc) {
    var callArguments = argumentSchema.getArgs(arguments, [
        { name: "transactionObject", optional: true, check: storageSystemInstance.isTransaction, defaultValue: null },
        { name: "completionFunc", optional: true, check: argumentSchema.isCallback(), defaultValue: function() { } }
      ]);
    transactionObject = callArguments.transactionObject;
    completionFunc = callArguments.completionFunc;

    var currentContext = this;
    if ( !transactionObject ) {
      currentContext.transaction(function (tran) { currentContext.clearDatabase(tran, completionFunc); });
      return;
    }
    // First, simulate schema synchronization to discover which tables were created.
    this.syncSchema(transactionObject, function () {
        var tableNamesList = [ ];
        for ( var propName in storageSystemInstance.createdTables ) {
          if ( storageSystemInstance.createdTables.hasOwnProperty(propName) ) {
            tableNamesList.push(propName);
          }
        }
        function removeSingleTable () {
          var tableToDrop = tableNamesList.pop();
          transactionObject.performSql("DROP TABLE IF EXISTS `" + tableToDrop + "`", null, function () {
              if ( tableNamesList.length > 0 ) {
                removeSingleTable();
              } else {
                finalCallback();
              }
            });
        }
        if ( tableNamesList.length > 0 ) {
          removeSingleTable();
        } else {
          finalCallback();
        }

        function finalCallback () {
          currentContext.resetState();
          storageSystemInstance.createdTables = { };
          if ( completionFunc ) completionFunc();
        }
      }, true);
  };

  /*
   * Transforms a database row into an application entity object.
   */
  function dbRowToObject (currentSessionContext, objectType, databaseRow, columnPrefix) {
    columnPrefix = columnPrefix || '';
    if ( currentSessionContext.monitoredObjects[databaseRow[columnPrefix + "identifier"]] ) { // Retrieve cached version
      return currentSessionContext.monitoredObjects[databaseRow[columnPrefix + "identifier"]];
    }
    var typeConverter = storageSystemInstance.schemaConverter;
    var rowMetadata = storageSystemInstance.getMetadataForObject(objectType);
    var objectConstructor = storageSystemInstance.defineObject(objectType); // Obtain object constructor
    if ( !databaseRow[columnPrefix + 'identifier'] ) { // Null value, no entity record found
      return null;
    }
    var newObject = new objectConstructor();
    newObject.identifier = typeConverter.dbValueToObjValue(databaseRow[columnPrefix + 'identifier'], typeConverter.keyIdentifierType);
    newObject._isNew = false;
    for ( var propertyKey in databaseRow ) {
      if ( databaseRow.hasOwnProperty(propertyKey) ) {
        if ( propertyKey.substring(0, columnPrefix.length) === columnPrefix ) {
          var actualProperty = propertyKey.substring(columnPrefix.length);
          if ( actualProperty !== 'identifier' ) {
            newObject._internalData[actualProperty] = typeConverter.dbValueToObjValue(databaseRow[propertyKey], rowMetadata.properties[actualProperty] || typeConverter.keyIdentifierType);
          }
        }
      }
    }
    return newObject;
  }

  /*
   * Internal function to persist an object record to the database.
   * This function is invoked by storageSystemInstance.commitChanges().
   */
  function storeRecord (entityObject, transactionRef, completionAction) {
    var objectMeta = storageSystemInstance.getMetadataForObject(entityObject._objectKind);
    var typeConverter = storageSystemInstance.schemaConverter;
    var columnNames = [ ];
    var columnValues = [ ];
    var placeholders = [ ];
    var updateAssignments = [ ];
    if ( entityObject._isNew ) { // Flag all properties as modified
      for ( var propertyIdentifier in objectMeta.properties ) {
        if ( objectMeta.properties.hasOwnProperty(propertyIdentifier) ) {
          entityObject._modifiedProperties[propertyIdentifier] = true;
        }
      }
    }
    for ( var propertyIdentifier in entityObject._modifiedProperties ) {
      if ( entityObject._modifiedProperties.hasOwnProperty(propertyIdentifier) ) {
        columnNames.push("`" + propertyIdentifier + "`");
        var valueType = objectMeta.properties[propertyIdentifier] || typeConverter.keyIdentifierType;
        columnValues.push(typeConverter.objValueToDbValue(entityObject._internalData[propertyIdentifier], valueType));
        placeholders.push(typeConverter.outputParam("?", valueType));
        updateAssignments.push("`" + propertyIdentifier + "` = " + typeConverter.outputParam("?", valueType));
      }
    }
    var relatedQueries = [ ];
    for ( var propertyIdentifier in objectMeta.hasMultiple ) {
      if ( objectMeta.hasMultiple.hasOwnProperty(propertyIdentifier) ) {
        relatedQueries = relatedQueries.concat(storageSystemInstance.retrieve(entityObject, propertyIdentifier).getPersistenceQueries());
      }
    }
    runQueriesSequentially(transactionRef, relatedQueries, function () {
        if ( columnNames.length === 0 ) { // No changes detected
          if ( completionAction ) completionAction();
          return;
        }
        entityObject._modifiedProperties = { };
        if ( entityObject._isNew ) {
          columnNames.push('identifier');
          columnValues.push(typeConverter.objKeyToDbKey(entityObject.identifier));
          placeholders.push(typeConverter.outputKeyParam('?'));
          var statement = "INSERT INTO `" + entityObject._objectKind + "` (" + columnNames.join(", ") + ") VALUES (" + placeholders.join(', ') + ")";
          entityObject._isNew = false;
          transactionRef.performSql(statement, columnValues, completionAction);
        } else {
          var statement = "UPDATE `" + entityObject._objectKind + "` SET " + updateAssignments.join(',') + " WHERE identifier = " + typeConverter.outputKey(entityObject.identifier);
          transactionRef.performSql(statement, columnValues, completionAction);
        }
      });
  }

  function deleteRecord (dataObject, transactionContext, onCompletion) {
    var objectDefinition = storageSystemInstance.getMetadataForObject(dataObject._objectKind);
    var typeConverter = storageSystemInstance.schemaConverter;
    var deletionQueries = [["DELETE FROM `" + dataObject._objectKind + "` WHERE identifier = " + typeConverter.outputKey(dataObject.identifier), null]];
    for ( var relationshipKey in objectDefinition.hasMultiple ) {
      if ( objectDefinition.hasMultiple.hasOwnProperty(relationshipKey) && objectDefinition.hasMultiple[relationshipKey].multipleToMany ) {
        var linkedTableName = objectDefinition.hasMultiple[relationshipKey].tableName;
        // The inverse property is not directly used here, but kept for context.
        deletionQueries.push(["DELETE FROM `" + linkedTableName + "` WHERE `" + objectDefinition.name + '_' + relationshipKey + "` = " + typeConverter.outputKey(dataObject.identifier), null]);
      }
    }
    runQueriesSequentially(transactionContext, deletionQueries, onCompletion);
  }

  /*
   * Helper function to execute a sequence of database queries asynchronously.
   * @param transObj The transaction to perform the queries within.
   * @param queryList An array of [query_string, arguments_array] tuples.
   * @param finalCb The function to invoke once all queries have completed.
   */
  function runQueriesSequentially (transObj, queryList, finalCb) {
    // queryList.reverse(); // This line was commented out in the original, maintaining its presence.
    var resultArgs = [ ];
    for ( var idx = 3; idx < arguments.length; idx++ ) {
      resultArgs.push(arguments[idx]);
    }
    storageSystemInstance.asyncSerialIterator(queryList, function (commandPair, nextStep) {
        transObj.performSql(commandPair[0], commandPair[1], nextStep, function (_ignoredResult, errorObject) {
            debugLog.log(errorObject.message);
            nextStep();
          });
      }, function () {
        if ( finalCb ) finalCb.apply(null, resultArgs);
      });
  }

  storageSystemInstance.runQueriesSequentially = runQueriesSequentially;

  // DataQuerySet Extensions for Relational Database Environment

  /*
   * Function invoked when the session is committed; it returns a list of SQL queries to execute
   * (as [query, args] tuples).
   */
  storageSystemInstance.DataQuerySet.prototype.getPersistenceQueries = function () { return [ ]; };

  var originalSetClone = storageSystemInstance.DataQuerySet.prototype.clone;

  storageSystemInstance.DataQuerySet.prototype.clone = function (copyListeners) {
    var clonedSet = originalSetClone.call(this, copyListeners);
    clonedSet._extraJoinStatements = this._extraJoinStatements.slice(0);
    clonedSet._extraFilterStatements = this._extraFilterStatements.slice(0);
    clonedSet._extraGroupStatements = this._extraGroupStatements.slice(0);
    clonedSet._multiToMultiRetrieve = this._multiToMultiRetrieve;
    return clonedSet;
  };

  var originalSetInit = storageSystemInstance.DataQuerySet.prototype.init;

  storageSystemInstance.DataQuerySet.prototype.init = function (contextHandle, objectKind, objectCreator) {
    originalSetInit.call(this, contextHandle, objectKind, objectCreator);
    this._multiToMultiRetrieve = null;
    this._extraJoinStatements = [ ];
    this._extraFilterStatements = [ ];
    this._extraGroupStatements = [ ];
  };

  var originalSetToString = storageSystemInstance.DataQuerySet.prototype.toUniqueString;

  storageSystemInstance.DataQuerySet.prototype.toUniqueString = function () {
    var idString = originalSetToString.call(this);
    idString += '|JoinedStatements:';
    for ( var idx = 0; idx < this._extraJoinStatements.length; idx++ ) {
      idString += this._extraJoinStatements[idx];
    }
    idString += '|FilteredStatements:';