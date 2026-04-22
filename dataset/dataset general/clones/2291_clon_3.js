function PersistentDataHandler(storeIdentifier, initialSize) {
  // Default to 5MB if no specific size is provided, ensuring compatibility with varying browser limits.
  const defaultStorageSize = 5 * 1024 * 1024; // 5 MB in bytes
  let effectiveSize = initialSize || defaultStorageSize;

  // Validate storeIdentifier
  if (typeof storeIdentifier !== 'string' || storeIdentifier.trim() === '') {
    throw new Error("A valid string identifier is required for the data store.");
  }

  const databaseName = `${storeIdentifier}_persistent_data.db`;

  // Check for the presence of the Web SQL Database API
  if (typeof window === 'undefined' || !window.openDatabase) {
    console.error("Web SQL Database API is not available in this environment.");
    // Optionally, throw an error or return a no-op object
    this.databaseInstance = null; // Indicate no database is available
    return;
  }

  // Detect specific platforms for database initialization variations
  const isWebOSPlatform = navigator && navigator.userAgent && navigator.userAgent.includes("webOS");

  if (isWebOSPlatform) {
    this.databaseInstance = openDatabase(databaseName);
  } else {
    // For other browsers, provide more parameters, including the estimated size and a creation callback.
    this.databaseInstance = openDatabase(databaseName, "1.0", "Data storage for " + storeIdentifier, effectiveSize, function() {
      // Database created or opened successfully (optional callback)
      // This space can be used for initial setup or logging.
    });
  }
}

PersistentDataHandler.prototype = {
  isDebuggingEnabled: false, // Flag to control logging verbosity
  _loggerInitialized: false, // Internal flag to optimize logger setup

  // Internal method to output debug information based on platform capabilities.
  _outputDebugInfo: function(messageContent) {
    if (!this.isDebuggingEnabled) {
      return; // Skip logging if debugging is disabled
    }

    // Lazy definition of the actual logging function for performance
    if (!this._loggerInitialized) {
      this._loggerInitialized = true;

      if (typeof Titanium !== "undefined" && Titanium.API && typeof Titanium.API.debug === "function") {
        this._outputDebugInfo = function(msg) {
          Titanium.API.debug(msg);
        };
      } else if (typeof Mojo !== "undefined" && Mojo.Log && typeof Mojo.Log.error === "function") {
        this._outputDebugInfo = function(msg) {
          Mojo.Log.error(msg); // Mojo often uses error for general logs
        };
      } else if (typeof console !== "undefined" && typeof console.log === "function") {
        this._outputDebugInfo = function(msg) {
          console.log(msg);
        };
      } else {
        // Fallback: If no specific logger is found, use a no-op function
        this._outputDebugInfo = function() {};
        console.warn("No specific logging mechanism found; debug output will be suppressed.");
        return; // Don't try to log the current message if no logger is available
      }
    }
    this._outputDebugInfo(messageContent); // Call the now-defined logger
  },

  // Transforms raw database query results into a more usable array of plain objects.
  _transformResultRows: function(queryResults) {
    const processedRecords = [];
    if (!queryResults || !queryResults.rows || queryResults.rows.length === 0) {
      return processedRecords; // Return empty array if no results
    }

    const totalRows = queryResults.rows.length;
    for (let idx = 0; idx < totalRows; idx++) {
      const rawEntry = queryResults.rows.item(idx);
      const formattedEntry = {};

      // Copy all properties from the read-only row object to a new writable object.
      // Using Object.assign for a more modern approach.
      Object.assign(formattedEntry, rawEntry);
      processedRecords.push(formattedEntry);
    }
    return processedRecords;
  },

  // Escapes single quotes in a string for safe inclusion in SQL queries.
  _sanitizeSqlString: function(inputString) {
    if (typeof inputString !== 'string') {
      this._outputDebugInfo("Warning: _sanitizeSqlString received non-string input.");
      return "''"; // Return an empty SQL string literal for non-strings
    }
    // Double-up single quotes to escape them within SQL string literals.
    return `'${inputString.replace(/'/g, "''")}'`;
  },

  // Constructs the WHERE clause of an SQL query based on provided conditions.
  _constructWhereClause: function(conditions) {
    let whereClauseString = "";
    const clauseFragments = [];

    if (!conditions || typeof conditions !== 'object' || Object.keys(conditions).length === 0) {
      return whereClauseString; // No conditions provided, return empty string
    }

    for (const columnKey in conditions) {
      if (!Object.prototype.hasOwnProperty.call(conditions, columnKey)) {
        continue; // Skip inherited properties
      }

      const currentCondition = conditions[columnKey];

      if (typeof currentCondition === "string") {
        clauseFragments.push(`${columnKey} = ${this._sanitizeSqlString(currentCondition)}`);
      } else if (Array.isArray(currentCondition)) {
        const comparisonOperator = currentCondition[0];
        let comparisonValue = currentCondition[1];

        if (typeof comparisonValue === "string") {
          // Only escape if not an IN operator (IN expects a list, not a single quoted string)
          if (comparisonOperator.toLowerCase() !== "in") {
            comparisonValue = this._sanitizeSqlString(comparisonValue);
          }
        } else if (Array.isArray(comparisonValue)) {
          // If the operand is an array (e.g., for IN clause), sanitize each element.
          const processedArrayElements = comparisonValue.map(arrayElement => {
            return typeof arrayElement === "string" ? this._sanitizeSqlString(arrayElement) : arrayElement;
          });
          comparisonValue = `(${processedArrayElements.join(",")})`; // Format as (val1, val2, ...)
        }
        clauseFragments.push(`${columnKey} ${comparisonOperator} ${comparisonValue}`);
      } else {
        // For numbers, booleans, or nulls, directly append.
        clauseFragments.push(`${columnKey} = ${currentCondition}`);
      }
    }

    if (clauseFragments.length > 0) {
      whereClauseString = ` WHERE ${clauseFragments.join(" AND ")}`;
    }

    return whereClauseString;
  },

  // Generates the SET clause for an SQL UPDATE statement.
  _generateUpdateStatement: function(tableName, recordData) {
    if (!recordData || typeof recordData !== 'object' || Object.keys(recordData).length === 0) {
      this._outputDebugInfo("Warning: _generateUpdateStatement received empty or invalid recordData.");
      return "";
    }

    const assignmentClauseFragments = [];
    for (const columnKey in recordData) {
      if (!Object.prototype.hasOwnProperty.call(recordData, columnKey)) {
        continue;
      }
      const value = recordData[columnKey];
      const sanitizedValue = typeof value === "string" ? this._sanitizeSqlString(value) : value;
      assignmentClauseFragments.push(`${columnKey} = ${sanitizedValue}`);
    }

    if (assignmentClauseFragments.length === 0) {
      return ""; // No fields to update
    }

    let finalSqlString = `UPDATE ${tableName} SET ${assignmentClauseFragments.join(", ")}`;

    // If an 'id' is present in the data, add it as a primary WHERE condition.
    // This is a common pattern but can be overridden by explicit conditions.
    if (recordData.id !== undefined && recordData.id !== null) {
      finalSqlString += ` WHERE id = ${recordData.id}`;
    }

    return finalSqlString;
  },

  // Executes a given SQL statement, handling success and failure callbacks.
  executeSqlStatement: function(sqlQuery, successCallback, failureCallback, transactionContext) {
    this._outputDebugInfo(`Executing SQL: ${sqlQuery}`);

    if (!this.databaseInstance) {
      const errorMsg = "Database instance is not initialized. Cannot execute SQL.";
      this._outputDebugInfo(errorMsg);
      if (failureCallback) failureCallback(errorMsg);
      return;
    }

    // Default error handler if none is provided
    const defaultFailureHandler = (tx, error) => {
      const errorMessage = error ? error.message : "Unknown database error.";
      this._outputDebugInfo(`SQL Error: ${errorMessage} for query: ${sqlQuery}`);
      if (failureCallback) {
        failureCallback(errorMessage);
      } else {
        console.error("Unhandled database error:", errorMessage);
      }
      return true; // Return true to rollback transaction on error
    };

    // Wrapper for success callback to standardize arguments
    let wrappedSuccessCallback = successCallback;
    if (successCallback) {
      wrappedSuccessCallback = function(tx, queryResult) {
        // The original success callback might expect only resultSet, not tx
        successCallback(queryResult);
      };
    } else {
      // Default success callback if none provided
      wrappedSuccessCallback = (tx, queryResult) => {
        this._outputDebugInfo(`SQL Success: Rows affected: ${queryResult.rowsAffected}, Insert ID: ${queryResult.insertId}`);
      };
    }

    // Determine if we're running within an existing transaction or starting a new one.
    if (transactionContext) {
      transactionContext.executeSql(sqlQuery, [], wrappedSuccessCallback, defaultFailureHandler);
    } else {
      this.databaseInstance.transaction(tx => {
        tx.executeSql(sqlQuery, [], wrappedSuccessCallback, defaultFailureHandler);
      }, defaultFailureHandler); // Transaction failure callback
    }
  },

  // Creates a new table with specified columns.
  establishTable: function(tableName, columnDefinitions, successCallback, failureCallback, transactionContext) {
    if (typeof tableName !== 'string' || tableName.trim() === '') {
      return failureCallback ? failureCallback("Table name cannot be empty.") : null;
    }
    if (!columnDefinitions || typeof columnDefinitions !== 'object' || Object.keys(columnDefinitions).length === 0) {
      this._outputDebugInfo(`Warning: No column definitions provided for table ${tableName}. Only PRIMARY KEY will be created.`);
    }

    const columnSqlFragments = ["id INTEGER PRIMARY KEY AUTOINCREMENT"]; // Always start with a primary key

    for (const colName in columnDefinitions) {
      if (Object.prototype.hasOwnProperty.call(columnDefinitions, colName)) {
        columnSqlFragments.push(`${colName} ${columnDefinitions[colName]}`);
      }
    }

    const finalColumnList = columnSqlFragments.join(", ");
    const sqlQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (${finalColumnList})`;
    this.executeSqlStatement(sqlQuery, successCallback, failureCallback, transactionContext);
  },

  // Deletes an existing table from the database.
  removeTable: function(tableName, successCallback, failureCallback, transactionContext) {
    if (typeof tableName !== 'string' || tableName.trim() === '') {
      return failureCallback ? failureCallback("Table name cannot be empty.") : null;
    }
    const sqlQuery = `DROP TABLE IF EXISTS ${tableName}`;
    this.executeSqlStatement(sqlQuery, successCallback, failureCallback, transactionContext);
  },

  // Renames an existing table.
  alterTableName: function(oldTableName, newTableName, successCallback, failureCallback, transactionContext) {
    if (typeof oldTableName !== 'string' || oldTableName.trim() === '' ||
        typeof newTableName !== 'string' || newTableName.trim() === '') {
      return failureCallback ? failureCallback("Both old and new table names must be valid strings.") : null;
    }
    const sqlQuery = `ALTER TABLE ${oldTableName} RENAME TO ${newTableName}`;
    this.executeSqlStatement(sqlQuery, successCallback, failureCallback, transactionContext);
  },

  // Creates an index on a specified column of a table.
  buildIndex: function(tableName, columnName, successCallback, failureCallback, transactionContext) {
    if (typeof tableName !== 'string' || tableName.trim() === '' ||
        typeof columnName !== 'string' || columnName.trim() === '') {
      return failureCallback ? failureCallback("Table and column names must be valid strings for index creation.") : null;
    }
    const indexName = `${tableName}_${columnName}_idx`; // Standard index naming convention
    const sqlQuery = `CREATE INDEX IF NOT EXISTS ${indexName} ON ${tableName} (${columnName})`;
    this.executeSqlStatement(sqlQuery, successCallback, failureCallback, transactionContext);
  },

  // Deletes an existing index.
  destroyIndex: function(tableName, columnName, successCallback, failureCallback, transactionContext) {
    if (typeof tableName !== 'string' || tableName.trim() === '' ||
        typeof columnName !== 'string' || columnName.trim() === '') {
      return failureCallback ? failureCallback("Table and column names must be valid strings for index deletion.") : null;
    }
    const indexName = `${tableName}_${columnName}_idx`;
    const sqlQuery = `DROP INDEX IF EXISTS ${indexName}`;
    this.executeSqlStatement(sqlQuery, successCallback, failureCallback, transactionContext);
  },

  // Adds a new column to an existing table.
  addTableColumn: function(tableName, newColumnName, columnDataType, successCallback, failureCallback, transactionContext) {
    if (typeof tableName !== 'string' || tableName.trim() === '' ||
        typeof newColumnName !== 'string' || newColumnName.trim() === '' ||
        typeof columnDataType !== 'string' || columnDataType.trim() === '') {
      return failureCallback ? failureCallback("Table name, new column name, and data type must be valid strings.") : null;
    }
    const sqlQuery = `ALTER TABLE ${tableName} ADD COLUMN ${newColumnName} ${columnDataType}`;
    this.executeSqlStatement(sqlQuery, successCallback, failureCallback, transactionContext);
  },

  // Retrieves records from a table based on conditions and options.
  retrieveRecords: function(tableName, conditions, queryOptions, successCallback, failureCallback, transactionContext) {
    const instanceRef = this; // Capture 'this' for use in callbacks

    if (typeof tableName !== 'string' || tableName.trim() === '') {
      return failureCallback ? failureCallback("Table name cannot be empty for record retrieval.") : null;
    }

    // Wrap the success callback to process result set rows into usable objects.
    let finalSuccessCallback = successCallback;
    if (successCallback) {
      finalSuccessCallback = function(queryResult) {
        const records = instanceRef._transformResultRows(queryResult);
        successCallback(records); // Pass processed records to the original callback
      };
    } else {
      // Default behavior if no success callback is provided: log the results.
      finalSuccessCallback = function(queryResult) {
        const records = instanceRef._transformResultRows(queryResult);
        instanceRef._outputDebugInfo("Retrieved records:", records);
      };
    }

    let sqlQuery = `SELECT * FROM ${tableName}`;
    sqlQuery += this._constructWhereClause(conditions);

    // Apply optional clauses like GROUP BY, ORDER BY, LIMIT, OFFSET.
    if (queryOptions && typeof queryOptions === 'object') {
      if (queryOptions.group) {
        sqlQuery += ` GROUP BY ${queryOptions.group}`;
      }
      if (queryOptions.order) {
        sqlQuery += ` ORDER BY ${queryOptions.order}`;
      }
      if (queryOptions.limit) {
        sqlQuery += ` LIMIT ${queryOptions.limit}`;
      }
      if (queryOptions.offset) {
        sqlQuery += ` OFFSET ${queryOptions.offset}`;
      }
    }

    this.executeSqlStatement(sqlQuery, finalSuccessCallback, failureCallback, transactionContext);
  },

  // Counts the number of records in a table that match specified conditions.
  countRecords: function(tableName, conditions, successCallback, failureCallback, transactionContext) {
    const instanceRef = this;

    if (typeof tableName !== 'string' || tableName.trim() === '') {
      return failureCallback ? failureCallback("Table name cannot be empty for record counting.") : null;
    }

    let finalSuccessCallback = successCallback;
    if (successCallback) {
      finalSuccessCallback = function(queryResult) {
        // The count is typically in the first row, under a column named 'COUNT(*)' or similar.
        let recordCount = 0;
        if (queryResult && queryResult.rows && queryResult.rows.length > 0) {
          const firstRow = queryResult.rows.item(0);
          recordCount = firstRow['COUNT(*)'] || firstRow['count(*)'] || firstRow['count'];
        }
        successCallback(recordCount);
      };
    } else {
      finalSuccessCallback = function(queryResult) {
        let recordCount = 0;
        if (queryResult && queryResult.rows && queryResult.rows.length > 0) {
          const firstRow = queryResult.rows.item(0);
          recordCount = firstRow['COUNT(*)'] || firstRow['count(*)'] || firstRow['count'];
        }
        instanceRef._outputDebugInfo(`Counted records: ${recordCount}`);
      };
    }

    let sqlQuery = `SELECT COUNT(*) FROM ${tableName}`;
    sqlQuery += this._constructWhereClause(conditions);

    this.executeSqlStatement(sqlQuery, finalSuccessCallback, failureCallback, transactionContext);
  },

  // Persists a record (either inserts a new one or updates an existing one).
  persistRecord: function(tableName, recordData, successCallback, failureCallback, transactionContext) {
    const instanceRef = this;

    if (typeof tableName !== 'string' || tableName.trim() === '') {
      return failureCallback ? failureCallback("Table name cannot be empty for record persistence.") : null;
    }
    if (!recordData || typeof recordData !== 'object' || Object.keys(recordData).length === 0) {
      return failureCallback ? failureCallback("Record data cannot be empty for persistence operations.") : null;
    }

    let sqlQuery;
    let originalSuccessCallback = successCallback; // Hold onto the original callback

    // If recordData has an 'id' property, assume an update operation.
    if (recordData.id !== undefined && recordData.id !== null) {
      sqlQuery = this._generateUpdateStatement(tableName, recordData);
      // For updates, the success callback typically doesn't need the insertId.
      successCallback = originalSuccessCallback ? function(queryResult) {
        originalSuccessCallback(); // Call original success with no arguments
      } : function(queryResult) {
        instanceRef._outputDebugInfo(`Record ID ${recordData.id} updated.`);
      };
    } else {
      // Otherwise, assume an insert operation.
      const columnNames = [];
      const values = [];

      for (const columnKey in recordData) {
        if (Object.prototype.hasOwnProperty.call(recordData, columnKey)) {
          columnNames.push(columnKey);
          const value = recordData[columnKey];
          values.push(typeof value === "string" ? this._sanitizeSqlString(value) : value);
        }
      }

      const columnList = columnNames.join(", ");
      const valueList = values.join(", ");
      sqlQuery = `INSERT INTO ${tableName} (${columnList}) VALUES(${valueList})`;

      // For inserts, the success callback often expects the new insertId.
      successCallback = originalSuccessCallback ? function(queryResult) {
        originalSuccessCallback(queryResult.insertId);
      } : function(queryResult) {
        instanceRef._outputDebugInfo(`New record inserted with ID: ${queryResult.insertId}`);
      };
    }

    this.executeSqlStatement(sqlQuery, successCallback, failureCallback, transactionContext);
  },

  // Updates records in a table that match specified conditions.
  modifyRecords: function(tableName, recordData, conditions, successCallback, failureCallback, transactionContext) {
    const instanceRef = this;

    if (typeof tableName !== 'string' || tableName.trim() === '') {
      return failureCallback ? failureCallback("Table name cannot be empty for record modification.") : null;
    }
    if (!recordData || typeof recordData !== 'object' || Object.keys(recordData).length === 0) {
      return failureCallback ? failureCallback("Record data for modification cannot be empty.") : null;
    }

    let sqlQuery = this._generateUpdateStatement(tableName, recordData);
    sqlQuery += this._constructWhereClause(conditions); // Apply additional conditions

    let finalSuccessCallback = successCallback;
    if (successCallback) {
      finalSuccessCallback = function(queryResult) {
        successCallback(); // Original update success callback typically takes no args
      };
    } else {
      finalSuccessCallback = function(queryResult) {
        instanceRef._outputDebugInfo(`Records in ${tableName} modified. Rows affected: ${queryResult.rowsAffected}`);
      };
    }

    this.executeSqlStatement(sqlQuery, finalSuccessCallback, failureCallback, transactionContext);
  },

  // Deletes records from a table based on conditions.
  deleteRecords: function(tableName, conditions, successCallback, failureCallback, transactionContext) {
    if (typeof tableName !== 'string' || tableName.trim() === '') {
      return failureCallback ? failureCallback("Table name cannot be empty for record deletion.") : null;
    }

    let sqlQuery = `DELETE FROM ${tableName}`;
    sqlQuery += this._constructWhereClause(conditions);

    const instanceRef = this;
    let finalSuccessCallback = successCallback;
    if (!successCallback) {
      finalSuccessCallback = function(queryResult) {
        instanceRef._outputDebugInfo(`Records deleted from ${tableName}. Rows affected: ${queryResult.rowsAffected}`);
      };
    }

    this.executeSqlStatement(sqlQuery, finalSuccessCallback, failureCallback, transactionContext);
  },

  // Executes a function within a database transaction.
  performTransaction: function(transactionFunction, successCallback, failureCallback) {
    if (typeof transactionFunction !== 'function') {
      const errorMsg = "Transaction function must be a callable function.";
      this._outputDebugInfo(errorMsg);
      if (failureCallback) failureCallback(errorMsg);
      return;
    }

    if (!this.databaseInstance) {
      const errorMsg = "Database instance is not initialized. Cannot perform transaction.";
      this._outputDebugInfo(errorMsg);
      if (failureCallback) failureCallback(errorMsg);
      return;
    }

    // Provide default callbacks if not supplied.
    const defaultSuccess = successCallback || function() {
      this._outputDebugInfo("Transaction completed successfully.");
    }.bind(this);
    const defaultFailure = failureCallback || function(error) {
      const errorMessage = error ? error.message : "An unknown error occurred during transaction.";
      this._outputDebugInfo(`Transaction failed: ${errorMessage}`);
    }.bind(this);

    this.databaseInstance.transaction(transactionFunction, defaultFailure, defaultSuccess);
  }
};