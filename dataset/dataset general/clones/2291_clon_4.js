class DataVault {
  constructor(vaultName, vaultSize) {
    const internalState = {
      underlyingDB: null,
      debugMode: false,
      outputMessenger: null, // Holds the determined logging function
      defaultDbSize: 5 * 1024 * 1024 // 5MB
    };
    // Using a WeakMap for internal state to avoid name collisions and simulate private fields
    DataVault._internalStateMap.set(this, internalState);

    // Initialize database connection
    const effectiveSize = vaultSize || internalState.defaultDbSize;
    const dbIdentifier = `${vaultName}.data_archive.db`; // Different database name suffix

    const dbConnectionArgs = [dbIdentifier, "", "", effectiveSize];
    if (navigator.userAgent.includes("webOS")) {
      // Preserve webOS specific handling
      dbConnectionArgs.pop(); // Remove size and callback if webOS
    }
    dbConnectionArgs.push(() => {}); // Empty callback for database creation

    internalState.underlyingDB = openDatabase(...dbConnectionArgs);

    // Determine logging mechanism upon instantiation
    if (typeof globalThis.Titanium !== "undefined") {
      internalState.outputMessenger = (msg) => globalThis.Titanium.API.debug(msg);
    } else if (typeof globalThis.Mojo !== "undefined") {
      internalState.outputMessenger = (msg) => globalThis.Mojo.Log.error(msg);
    } else if (typeof console !== "undefined" && typeof console.warn === "function") {
      internalState.outputMessenger = (msg) => console.warn(msg); // Diverge by using console.warn
    } else {
      internalState.outputMessenger = () => {}; // No-op logger
    }
  }

  // Static WeakMap to store private internal state for each instance
  static _internalStateMap = new WeakMap();

  // --- Internal Utility Methods (using private class method syntax) ---

  #reportActivity(message) {
    const internalState = DataVault._internalStateMap.get(this);
    if (internalState.debugMode && internalState.outputMessenger) {
      internalState.outputMessenger(message);
    }
  }

  #sanitizeSQLString(inputStr) {
    return `'${String(inputStr).replace(/'/g, "''")}'`;
  }

  #processQueryResult(queryResult) {
    // Functional approach: Array.from + map + spread for copying rows
    return Array.from({
      length: queryResult.rows.length
    }, (_, i) => queryResult.rows.item(i)).map(rawRow => ({ ...rawRow
    }));
  }

  #assembleCriterionClause(criteria) {
    if (!criteria) {
      return "";
    }

    const clauseSegments = Object.entries(criteria).map(([fieldName, criterionVal]) => {
      if (typeof criterionVal === "string") {
        return `${fieldName} = ${this.#sanitizeSQLString(criterionVal)}`;
      } else if (Array.isArray(criterionVal)) {
        const [comparisonOperator, comparisonValue] = criterionVal;
        const lowerCaseOperator = String(comparisonOperator).toLowerCase();

        let processedOperand;
        if (typeof comparisonValue === "string") {
          // Replicating original's specific (and potentially buggy for 'IN') escaping logic
          if (lowerCaseOperator !== "in" && lowerCaseOperator !== "not in") {
            processedOperand = this.#sanitizeSQLString(comparisonValue);
          } else {
            processedOperand = comparisonValue; // Original did not escape for 'IN'/'NOT IN' if operand was a string
          }
        } else if (Array.isArray(comparisonValue)) {
          // Map + join for array operands, escaping strings
          processedOperand = `(${comparisonValue.map(item =>
                        typeof item === "string" ? this.#sanitizeSQLString(item) : item
                    ).join(",")})`;
        } else {
          processedOperand = comparisonValue; // Numeric or other literal
        }
        return `${fieldName} ${comparisonOperator} ${processedOperand}`;
      } else {
        return `${fieldName} = ${criterionVal}`;
      }
    });

    const finalClause = clauseSegments.join(" AND ");
    return finalClause ? ` WHERE ${finalClause}` : "";
  }

  #formUpdateStatement(tableName, recordData) {
    // Functional approach: map entries to 'key = value' pairs
    const assignmentClause = Object.entries(recordData)
      .map(([fieldName, fieldValue]) => {
        const processedValue = typeof fieldValue === "string" ? this.#sanitizeSQLString(fieldValue) : fieldValue;
        return `${fieldName} = ${processedValue}`;
      })
      .join(", "); // No trailing comma due to join

    let statement = `UPDATE ${tableName} SET ${assignmentClause}`;
    if (recordData.id) {
      statement += ` WHERE id = ${recordData.id}`;
    }
    return statement;
  }

  // --- Core Execution Method (Promise-based) ---

  executeStatement(sqlString, transactionScope = null) {
    const internalState = DataVault._internalStateMap.get(this);
    this.#reportActivity(sqlString);

    return new Promise((resolve, reject) => {
      const executeInTx = (tx) => {
        tx.executeSql(
          sqlString, [],
          (_, queryResult) => resolve(queryResult),
          (_, error) => {
            reject(error.message);
            return true; // Return true to rollback the transaction on error
          }
        );
      };

      if (transactionScope) {
        executeInTx(transactionScope);
      } else {
        // Handle standalone transaction
        internalState.underlyingDB.transaction(executeInTx, (error) => reject(error.message));
      }
    });
  }

  // --- Public API Methods (async/await for Promise-based operations) ---

  setDebugMode(enabled) {
    DataVault._internalStateMap.get(this).debugMode = enabled;
  }

  async establishSchema(tableName, fieldDefinitions, onSuccess = null, onError = null, transactionScope = null) {
    const fieldList = Object.entries(fieldDefinitions)
      .map(([fieldName, fieldType]) => `, ${fieldName} ${fieldType}`)
      .join("");

    const sqlStatement = `CREATE TABLE IF NOT EXISTS ${tableName} (id INTEGER PRIMARY KEY AUTOINCREMENT${fieldList})`;

    try {
      await this.executeStatement(sqlStatement, transactionScope);
      if (onSuccess) onSuccess();
    } catch (error) {
      if (onError) onError(error);
      else throw error; // Re-throw if no error callback
    }
  }

  async removeSchema(tableName, onSuccess = null, onError = null, transactionScope = null) {
    const sqlStatement = `DROP TABLE IF EXISTS ${tableName}`;
    try {
      await this.executeStatement(sqlStatement, transactionScope);
      if (onSuccess) onSuccess();
    } catch (error) {
      if (onError) onError(error);
      else throw error;
    }
  }

  async relabelSchema(oldName, newName, onSuccess = null, onError = null, transactionScope = null) {
    const sqlStatement = `ALTER TABLE ${oldName} RENAME TO ${newName}`;
    try {
      await this.executeStatement(sqlStatement, transactionScope);
      if (onSuccess) onSuccess();
    } catch (error) {
      if (onError) onError(error);
      else throw error;
    }
  }

  async indexField(tableName, fieldName, onSuccess = null, onError = null, transactionScope = null) {
    const sqlStatement = `CREATE INDEX IF NOT EXISTS ${tableName}_${fieldName}_idx ON ${tableName} (${fieldName})`;
    try {
      await this.executeStatement(sqlStatement, transactionScope);
      if (onSuccess) onSuccess();
    } catch (error) {
      if (onError) onError(error);
      else throw error;
    }
  }

  async unindexField(tableName, fieldName, onSuccess = null, onError = null, transactionScope = null) {
    const sqlStatement = `DROP INDEX IF EXISTS ${tableName}_${fieldName}_idx`;
    try {
      await this.executeStatement(sqlStatement, transactionScope);
      if (onSuccess) onSuccess();
    } catch (error) {
      if (onError) onError(error);
      else throw error;
    }
  }

  async addField(tableName, fieldName, fieldType, onSuccess = null, onError = null, transactionScope = null) {
    const sqlStatement = `ALTER TABLE ${tableName} ADD COLUMN ${fieldName} ${fieldType}`;
    try {
      await this.executeStatement(sqlStatement, transactionScope);
      if (onSuccess) onSuccess();
    } catch (error) {
      if (onError) onError(error);
      else throw error;
    }
  }

  async retrieveRecords(tableName, criteria = null, queryOptions = {}, onSuccess = null, onError = null, transactionScope = null) {
    let sqlStatement = `SELECT * FROM ${tableName}`;
    sqlStatement += this.#assembleCriterionClause(criteria);

    if (queryOptions) {
      if (queryOptions.group) sqlStatement += ` GROUP BY ${queryOptions.group}`;
      if (queryOptions.order) sqlStatement += ` ORDER BY ${queryOptions.order}`;
      if (queryOptions.limit) sqlStatement += ` LIMIT ${queryOptions.limit}`;
      if (queryOptions.offset) sqlStatement += ` OFFSET ${queryOptions.offset}`;
    }

    try {
      const queryResult = await this.executeStatement(sqlStatement, transactionScope);
      const processedRows = this.#processQueryResult(queryResult);
      if (onSuccess) onSuccess(processedRows);
      else this.#reportActivity(processedRows); // Original logs if no success callback
      return processedRows; // Allow await to return value
    } catch (error) {
      if (onError) onError(error);
      else throw error;
    }
  }

  async countRecords(tableName, criteria = null, onSuccess = null, onError = null, transactionScope = null) {
    let sqlStatement = `SELECT COUNT(*) FROM ${tableName}`;
    sqlStatement += this.#assembleCriterionClause(criteria);

    try {
      const queryResult = await this.executeStatement(sqlStatement, transactionScope);
      const rowCount = queryResult.rows.item(0)["COUNT(*)"];
      if (onSuccess) onSuccess(rowCount);
      else this.#reportActivity(rowCount); // Original logs if no success callback
      return rowCount; // Allow await to return value
    } catch (error) {
      if (onError) onError(error);
      else throw error;
    }
  }

  async storeRecord(tableName, recordData, onSuccess = null, onError = null, transactionScope = null) {
    let sqlStatement;
    let returnedId = null;

    if (recordData.id) {
      // Update existing record
      sqlStatement = this.#formUpdateStatement(tableName, recordData);
    } else {
      // Insert new record
      const fieldNames = Object.keys(recordData).join(", ");
      const fieldValues = Object.values(recordData)
        .map(val => typeof val === "string" ? this.#sanitizeSQLString(val) : val)
        .join(", ");
      sqlStatement = `INSERT INTO ${tableName} (${fieldNames}) VALUES(${fieldValues})`;
    }

    try {
      const queryResult = await this.executeStatement(sqlStatement, transactionScope);
      if (!recordData.id) { // Only for inserts
        returnedId = queryResult.insertId;
      }
      if (onSuccess) onSuccess(returnedId); // Original passes insertId for insert, nothing for update
      else if (recordData.id) this.#reportActivity(queryResult); // Logs resultSet for update
      else this.#reportActivity(returnedId); // Logs insertId for insert
      return returnedId; // Allow await to return value
    } catch (error) {
      if (onError) onError(error);
      else throw error;
    }
  }

  async alterRecords(tableName, recordData, criteria, onSuccess = null, onError = null, transactionScope = null) {
    let sqlStatement = this.#formUpdateStatement(tableName, recordData);
    sqlStatement += this.#assembleCriterionClause(criteria);

    try {
      const queryResult = await this.executeStatement(sqlStatement, transactionScope);
      if (onSuccess) onSuccess(); // Original passes nothing to success
      else this.#reportActivity(queryResult); // Logs resultSet if no success callback
    } catch (error) {
      if (onError) onError(error);
      else throw error;
    }
  }

  async deleteRecords(tableName, criteria, onSuccess = null, onError = null, transactionScope = null) {
    let sqlStatement = `DELETE FROM ${tableName}`;
    sqlStatement += this.#assembleCriterionClause(criteria);

    try {
      await this.executeStatement(sqlStatement, transactionScope);
      if (onSuccess) onSuccess();
    } catch (error) {
      if (onError) onError(error);
      else throw error;
    }
  }

  conductTransaction(transactionFunction, onError = null, onSuccess = null) {
    const internalState = DataVault._internalStateMap.get(this);
    return new Promise((resolve, reject) => {
      internalState.underlyingDB.transaction(
        (tx) => {
          try {
            transactionFunction(tx); // Execute the user-provided function within the transaction
          } catch (e) {
            // If the transactionFunction itself throws, reject the promise
            reject(e);
            // Returning false from the transaction callback would cause it to rollback,
            // but the error handler below will also be called.
            // For Web SQL, simply throwing inside the callback does not automatically
            // propagate to the transaction error handler. The executeSql error handler
            // returning true is the primary mechanism for rolling back.
            // However, this structure ensures the promise is rejected.
          }
        },
        (error) => { // Error callback for the transaction itself
          if (onError) onError(error);
          reject(error);
        },
        () => { // Success callback for the transaction itself
          if (onSuccess) onSuccess();
          resolve();
        }
      );
    });
  }
}