function DataVault(resourceId, capacity) {
  // Establish default capacity as 5 megabytes if not specified,
  // accounting for potential future browser restrictions on storage.
  capacity = capacity || 5 * 1024 * 1024;

  // Determine platform-specific database handling
  if ( navigator.userAgent.indexOf("webOS") !== -1 ) {
    this.dataStoreRef = openDatabase(resourceId + ".application_data.db");
  }
  else {
    this.dataStoreRef = openDatabase(
      resourceId + ".application_data.db",
      '',
      '',
      capacity,
      function() {}
    );
  }
}

DataVault.prototype = {
  // Flag to control debug output
  debugEnabled: false,

  // Internal method for logging messages
  _writeMessage: function(payload) {
    // If debug output is disabled, exit early.
    if (!this.debugEnabled) {
      return;
    }

    // Lazily define the actual logging mechanism based on environment,
    // (technique borrowed from other frameworks).
    if ( typeof Titanium !== "undefined" ) {
      this._writeMessage = function(payload) {
        Titanium.API.debug(payload);
      };
    }
    else if ( typeof Mojo !== "undefined" ) {
      this._writeMessage = function(payload) {
        Mojo.Log.error(payload);
      };
    }
    else if ( typeof console !== "undefined" && typeof console.log === "function" ) {
      this._writeMessage = function(payload) {
        console.log(payload);
      };
    }
    // Execute the now-defined logging function
    this._writeMessage(payload);
  },

  // Transforms raw database queryResults into a list of plain JavaScript objects.
  // This is necessary because resultSet rows are often read-only.
  _assembleRecords: function(queryResults) {
    var itemArray = [];
    var totalEntries = queryResults.rows.length;
    for ( var currentIdx = 0; currentIdx < totalEntries; currentIdx++ ) {
      var activeEntry = queryResults.rows.item(currentIdx);
      var processedRecord = {};
      // Copy all properties from the database entry to a new mutable object.
      for ( var propertyKey in activeEntry ) {
        processedRecord[propertyKey] = activeEntry[propertyKey];
      }
      itemArray.push(processedRecord);
    }
    return itemArray;
  },

  // Escapes single quotes in a string for SQL insertion.
  _sanitizeText: function(rawText) {
    return "'" + rawText.replace(/'/g, "''") + "'";
  },

  // Generates the SQL WHERE clause from a set of filter criteria.
  _generateFilterClause: function(filterCriteria) {
    var criteriaString = "",
        clauseSegments = [],
        constraintItem,
        comparisonOp,
        targetValue,
        arrayMember;

    // If no criteria are provided, return an empty string.
    if (!filterCriteria) {
      return criteriaString;
    }

    // Iterate through each criterion to build the SQL parts.
    for ( var attributeKey in filterCriteria ) {
      constraintItem = filterCriteria[attributeKey];

      if ( typeof constraintItem === "string" ) {
        clauseSegments.push(attributeKey + " = " + this._sanitizeText(constraintItem));
      }
      else if ( constraintItem.constructor === Array ) {
        comparisonOp = constraintItem[0];
        targetValue = constraintItem[1];

        if ( typeof targetValue === "string" ) {
          // Special handling for 'IN' operator to avoid quoting the entire list.
          if ( comparisonOp.toLowerCase() !== "in" ) {
            targetValue = this._sanitizeText(targetValue);
          }
        }
        else if ( targetValue.constructor === Array ) {
          // Sanitize each element in an array of values.
          for ( var arrIndex = 0, arrLen = targetValue.length; arrIndex < arrLen; arrIndex++ ) {
            arrayMember = targetValue[arrIndex];
            if ( typeof arrayMember === "string" ) {
              targetValue[arrIndex] = this._sanitizeText(arrayMember);
            }
          }
          targetValue = "(" + targetValue.join(",") + ")";
        }
        clauseSegments.push(attributeKey + " " + comparisonOp + " " + targetValue);
      }
      else {
        // Handle non-string, non-array conditions (e.g., numbers, booleans)
        clauseSegments.push(attributeKey + " = " + constraintItem);
      }
    }
    criteriaString = clauseSegments.join(" AND ");

    // Prepend " WHERE " if any conditions were generated.
    if ( criteriaString ) {
      criteriaString = " WHERE " + criteriaString;
    }

    return criteriaString;
  },

  // Constructs an SQL UPDATE statement.
  _constructUpdateStatement: function(collectionName, recordDetails) {
    var assignmentClause = "";

    // Build the SET clause by iterating through data fields.
    for ( var attributeKey in recordDetails ) {
      if ( typeof recordDetails[attributeKey] === "string" ) {
        assignmentClause += attributeKey + " = '" + recordDetails[attributeKey].replace(/'/g, "''") + "', ";
      }
      else {
        assignmentClause += attributeKey + " = " + recordDetails[attributeKey] + ", ";
      }
    }

    // Remove the trailing comma and space.
    assignmentClause = assignmentClause.slice(0, -2);

    var queryStatement = "UPDATE " + collectionName + " SET " + assignmentClause;

    // Append WHERE clause for specific record if 'id' is present.
    if ( recordDetails.id ) {
      queryStatement += " WHERE id = " + recordDetails.id;
    }

    return queryStatement;
  },

  // Executes a given SQL command.
  // Expects onCompletion to handle an array of objects, onError an error string.
  performQuery: function(commandText, onCompletion, onError, atomicOperation) {
    this._writeMessage(commandText);

    // If a success callback and transaction context are provided, wrap the callback.
    if ( onCompletion && atomicOperation ) {
      var originalSuccessHandler = onCompletion;
      onCompletion = function(opContext, fetchOutcome) {
        originalSuccessHandler(fetchOutcome);
      };
    }

    // Execute within the provided transaction or start a new one.
    if ( atomicOperation ) {
      atomicOperation.executeSql(commandText, [], onCompletion, onError);
    }
    else {
      this.dataStoreRef.transaction(function(opContext) {
        opContext.executeSql(commandText, [],
          function(opContext, fetchOutcome) {
            if ( onCompletion ) {
              onCompletion(fetchOutcome);
            }
          },
          function(opContext, errorDetails) {
            if ( onError ) {
              onError(errorDetails.message);
            }
          }
        );
      });
    }
  },

  // Defines a new collection (table) in the database.
  // schemaFields should be an object like {fieldName: fieldType}.
  establishCollection: function(collectionName, schemaFields, onCompletion, onError, opContext) {
    var fieldDeclaration = "";

    // Build the column definitions string.
    for ( var fieldName in schemaFields ) {
      fieldDeclaration += ", " + fieldName + " " + schemaFields[fieldName];
    }

    // Construct the CREATE TABLE SQL statement.
    // The primary key is assumed to be 'id' for consistency with update/write operations.
    var queryStatement = "CREATE TABLE IF NOT EXISTS " + collectionName + " (id INTEGER PRIMARY KEY AUTOINCREMENT" + fieldDeclaration + ")";
    this.performQuery(queryStatement, onCompletion, onError, opContext);
  },

  // Removes a collection (table) from the database.
  destroySchema: function(collectionName, onCompletion, onError, opContext) {
    var queryStatement = "DROP TABLE IF EXISTS " + collectionName;
    this.performQuery(queryStatement, onCompletion, onError, opContext);
  },

  // Renames an existing collection (table).
  relabelCollection: function(originalLabel, updatedLabel, onCompletion, onError, opContext) {
    var queryStatement = "ALTER TABLE " + originalLabel + " RENAME TO " + updatedLabel;
    this.performQuery(queryStatement, onCompletion, onError, opContext);
  },

  // Creates an index on a specific field within a collection.
  addIndex: function(collectionIdentifier, indexedField, onCompletion, onError, opContext) {
    var queryStatement = "CREATE INDEX IF NOT EXISTS " + collectionIdentifier + "_" + indexedField + "_idx ON " + collectionIdentifier + " (" + indexedField + ")";
    this.performQuery(queryStatement, onCompletion, onError, opContext);
  },

  // Deletes an index from a collection.
  removeIndex: function(collectionIdentifier, indexedField, onCompletion, onError, opContext) {
    var queryStatement = "DROP INDEX IF EXISTS " + collectionIdentifier + "_" + indexedField + "_idx";
    this.performQuery(queryStatement, onCompletion, onError, opContext);
  },

  // Adds a new field (column) to an existing collection.
  addField: function(collectionIdentifier, fieldName, fieldType, onCompletion, onError, opContext) {
    var queryStatement = "ALTER TABLE " + collectionIdentifier + " ADD COLUMN " + fieldName + " " + fieldType;
    this.performQuery(queryStatement, onCompletion, onError, opContext);
  },

  // Retrieves records from a collection based on criteria.
  // filterCriteria: object like {fieldName: requiredValue} or {fieldName: [comparisonOp, comparisonValue]}
  fetchEntities: function(collectionName, filterCriteria, fetchSettings, onCompletion, onError, opContext) {
    var instanceRef = this;

    // Wrap the success callback to process results before passing them.
    if ( onCompletion ) {
      var originalSuccessHandler = onCompletion;
      onCompletion = function(fetchOutcome) {
        var recordList = instanceRef._assembleRecords(fetchOutcome);
        originalSuccessHandler(recordList);
      };
    }
    else {
      // Default success handler if none provided, just logs the records.
      onCompletion = function(fetchOutcome) {
        var recordList = instanceRef._assembleRecords(fetchOutcome);
        instanceRef._writeMessage(recordList);
      };
    }

    var queryStatement = "SELECT * FROM " + collectionName;
    queryStatement += this._generateFilterClause(filterCriteria);

    // Append optional clauses like GROUP BY, ORDER BY, LIMIT, OFFSET.
    if ( fetchSettings ) {
      if ( fetchSettings.groupingKey ) {
        queryStatement += " GROUP BY " + fetchSettings.groupingKey;
      }
      if ( fetchSettings.sortOrder ) {
        queryStatement += " ORDER BY " + fetchSettings.sortOrder;
      }
      if ( fetchSettings.maxResults ) {
        queryStatement += " LIMIT " + fetchSettings.maxResults;
      }
      if ( fetchSettings.startOffset ) {
        queryStatement += " OFFSET " + fetchSettings.startOffset;
      }
    }

    this.performQuery(queryStatement, onCompletion, onError, opContext);
  },

  // Counts records in a collection.
  // onCompletion expects the totalEntries as a number.
  tallyRecords: function(collectionName, filterCriteria, onCompletion, onError, opContext) {
    if ( onCompletion ) {
      var originalSuccessHandler = onCompletion;
      onCompletion = function(fetchOutcome) {
        var totalEntries = fetchOutcome.rows.item(0)["COUNT(*)"];
        originalSuccessHandler(totalEntries);
      };
    }
    else {
      var instanceRef = this;
      onCompletion = function(fetchOutcome) {
        var totalEntries = fetchOutcome.rows.item(0)["COUNT(*)"];
        instanceRef._writeMessage(totalEntries);
      };
    }

    var queryStatement = "SELECT COUNT(*) FROM " + collectionName;
    queryStatement += this._generateFilterClause(filterCriteria);

    this.performQuery(queryStatement, onCompletion, onError, opContext);
  },

  // Persists data to a collection (inserts or updates).
  // recordDetails is an object {fieldName: value}.
  // onCompletion: no parameters for update, generatedId for insert.
  persistRecord: function(collectionName, recordDetails, onCompletion, onError, opContext) {
    var instanceRef = this,
        queryStatement,
        prevSuccessHandler;

    if ( recordDetails.id ) {
      // If an ID exists, this is an update operation.
      queryStatement = this._constructUpdateStatement(collectionName, recordDetails);

      if ( onCompletion ) {
        prevSuccessHandler = onCompletion;
        onCompletion = function(fetchOutcome) { // fetchOutcome is unused for update success
          prevSuccessHandler();
        };
      }
      else {
        onCompletion = function(fetchOutcome) {
          instanceRef._writeMessage(fetchOutcome);
        };
      }
    }
    else {
      // No ID, so this is an insert operation.
      var fieldNamesClause = "",
          dataValuesText = "";

      for ( var attributeKey in recordDetails ) {
        fieldNamesClause += attributeKey + ", ";
        if ( typeof recordDetails[attributeKey] === "string" ) {
          dataValuesText += "'" + recordDetails[attributeKey].replace(/'/g, "''") + "', ";
        }
        else {
          dataValuesText += recordDetails[attributeKey] + ", ";
        }
      }
      fieldNamesClause = fieldNamesClause.slice(0, -2);
      dataValuesText = dataValuesText.slice(0, -2);

      queryStatement = "INSERT INTO " + collectionName + " (" + fieldNamesClause + ") VALUES(" + dataValuesText + ")";

      if ( onCompletion ) {
        prevSuccessHandler = onCompletion;
        onCompletion = function(fetchOutcome) {
          prevSuccessHandler(fetchOutcome.insertId);
        };
      }
      else {
        onCompletion = function(fetchOutcome) {
          instanceRef._writeMessage(fetchOutcome.insertId);
        };
      }
    }
    this.performQuery(queryStatement, onCompletion, onError, opContext);
  },

  // Modifies existing records in a collection.
  alterData: function(collectionName, recordDetails, filterCriteria, onCompletion, onError, opContext) {
    var queryStatement = this._constructUpdateStatement(collectionName, recordDetails);
    queryStatement += this._generateFilterClause(filterCriteria);

    if ( onCompletion ) {
      var originalSuccessHandler = onCompletion;
      onCompletion = function(fetchOutcome) { // fetchOutcome unused
        originalSuccessHandler();
      };
    }
    else {
      var instanceRef = this;
      onCompletion = function(fetchOutcome) {
        instanceRef._writeMessage(fetchOutcome);
      };
    }

    this.performQuery(queryStatement, onCompletion, onError, opContext);
  },

  // Removes records from a collection.
  // filterCriteria is an object with {fieldName: requiredValue}.
  deleteRecords: function(collectionName, filterCriteria, onCompletion, onError, opContext) {
    var queryStatement = "DELETE FROM " + collectionName;
    queryStatement += this._generateFilterClause(filterCriteria);
    this.performQuery(queryStatement, onCompletion, onError, opContext);
  },

  // Executes an operation within a database transaction.
  // transactionFunction receives the transaction context object.
  executeAtomic: function(transactionFunction, onCompletion, onError) {
    this.dataStoreRef.transaction(transactionFunction, onError || function() {}, onCompletion || function() {});
  }
};