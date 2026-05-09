/*
 * DataVault.js - Web Storage Schema Manager
 *
 * This module facilitates interaction with HTML5 Web SQL Database objects.
 *
 * Licensed under the MIT License.
 * Copyright (c) 2023 [Your Name/Org], based on work by Daniel J. Pinter (2011).
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
/* eslint-disable no-console */
(function() {
  "use strict";

  // Core module constructor
  const SchemaVault = function(configOptions) {
    const selfRef = this; // Maintain a consistent reference to 'this'

    // Initialize internal state variables
    selfRef.databaseHandle = null;
    selfRef.lastErrorDetail = null;
    selfRef.isStoreReady = false;
    selfRef.fullIdentifier = null;
    selfRef.storageCapacity = null;
    selfRef.currentSchemaDef = {};
    selfRef.isSchemaDefined = false;
    selfRef.shortIdentifier = null;
    selfRef.schemaVersion = null;

    // Default configuration settings
    selfRef.moduleSettings = {
      enableLogging: false,
      asyncSchemaLoad: false,
      forceReset: false,
      schemaSourcePath: null,
      schemaDefinitionObject: null
    };

    // Overlay user-provided configuration
    if (configOptions && typeof configOptions === 'object') {
      Object.assign(selfRef.moduleSettings, configOptions);
    }

    // Initiate the setup procedure
    selfRef.beginSetupProcess();
  };

  // Regular expressions for parsing SQL DDL statements
  const sqlSyntaxParser = /(ALTER|CREATE|UPDATE)\s+(?:(?:UNIQUE\s+)?(INDEX|TABLE|TRIGGER|VIEW)\s+(?:IF\s+NOT\s+EXISTS\s+)?)?(?:(?:OR\s+(?:ABORT|FAIL|IGNORE|REPLACE|ROLLBACK)\s+))?(\w+)\s*(?:\((.*)\))?/i;
  const constraintPattern = /,\s?((?:CHECK|FOREIGN\s+KEY|PRIMARY\s+KEY|UNIQUE).*)/i;

  // Prototype methods for SchemaVault
  SchemaVault.prototype = {

    /**
     * Logs a message to the console if debugging is enabled.
     * @param {string} message - The message string to log.
     */
    logMessage: function(message) {
      if (this.moduleSettings.enableLogging && typeof console !== 'undefined' && console.log) {
        console.log(`[SchemaVault DEBUG]: ${message}`);
      }
    },

    /**
     * Handles database and SQL errors, logging them to the console.
     * @param {SQLError|null} dbError - Database transaction error object.
     * @param {SQLError|null} sqlError - SQL statement error object.
     * @param {string|null} customMessage - An optional custom error message.
     * @returns {boolean} Always returns true to indicate error handling.
     */
    handleOperationError: function(dbError, sqlError, customMessage) {
      let finalErrorMessage = '';

      if (dbError && typeof dbError === 'object') {
        if (dbError.message && dbError.message.includes('callback did not return false')) {
          return true; // Suppress this specific internal WebSQL error
        }
        finalErrorMessage = `Database Transaction Error (${dbError.code}): ${dbError.message}`;
      } else if (sqlError && typeof sqlError === 'object') {
        finalErrorMessage = `SQL Execution Error (${sqlError.code}): ${sqlError.message}`;
      } else if (customMessage) {
        finalErrorMessage = `Custom Error: ${customMessage}`;
      } else {
        finalErrorMessage = 'An unknown operation error occurred.';
      }

      this.lastErrorDetail = finalErrorMessage;
      if (typeof console !== 'undefined' && console.error) {
        console.error(`\n**********\n* SCHEMA VAULT ERROR: ${finalErrorMessage}\n**********\n`);
      }
      return true;
    },

    /**
     * Initiates the database setup process, including schema loading,
     * creation, population, and upgrades.
     */
    beginSetupProcess: function() {
      const selfRef = this; // Capture 'this' for nested functions
      let schemaDataBundle = null;
      let storageConfig = null;

      /**
       * Inserts records into a specified table.
       * @param {SQLTransaction} transaction - The active SQL transaction.
       * @param {string} tableName - The name of the table.
       * @param {object} tableDefinition - Object containing table schema and records.
       */
      const populateDataTable = (transaction, tableName, tableDefinition) => {
        if (!tableDefinition.records || tableDefinition.records.length === 0) {
          selfRef.logMessage(`No records to populate for table '${selfRef.shortIdentifier}.${tableName}'.`);
          return;
        }

        tableDefinition.records.forEach(recordItem => {
          const columnNames = Object.keys(recordItem);
          const columnPlaceholders = columnNames.map(() => '?');
          const valuesArray = columnNames.map(col => recordItem[col]);

          const insertSql = `INSERT INTO ${tableName} (${columnNames.join(', ')}) VALUES (${columnPlaceholders.join(', ')});`;

          transaction.executeSql(
            insertSql,
            valuesArray,
            null, // Success callback (can be null for simple inserts)
            selfRef.handleOperationError
          );
        });
        selfRef.logMessage(`Table '${selfRef.shortIdentifier}.${tableName}' populated with ${tableDefinition.records.length} records.`);
      };

      /**
       * Executes DDL statements for database objects (tables, indices, etc.).
       * @param {SQLTransaction} transaction - The active SQL transaction.
       * @param {string} objectType - Type of database object (e.g., 'TABLE', 'INDEX').
       * @param {string} objectName - Name of the database object.
       * @param {object} objectDefinition - Definition object for the database object.
       */
      const applyDDLStatement = (transaction, objectType, objectName, objectDefinition) => {
        let ddlSql = objectDefinition.sql;

        if (!ddlSql) {
          // Construct DDL for tables if not explicitly provided
          if (objectType.toUpperCase() === 'TABLE' && objectDefinition.columns) {
            const columnDefinitions = Object.entries(objectDefinition.columns)
              .map(([colName, colType]) => `${colName} ${colType}`);
            const tableConstraint = objectDefinition.tableConstraint ? `, ${objectDefinition.tableConstraint}` : '';
            ddlSql = `CREATE TABLE IF NOT EXISTS ${objectDefinition.name} (${columnDefinitions.join(', ')}${tableConstraint});`;
          } else {
            selfRef.handleOperationError(null, null, `Missing SQL definition for ${objectType} '${objectName}'.`);
            return;
          }
        }

        const sqlActionMatch = ddlSql.match(sqlSyntaxParser);
        const actionVerb = sqlActionMatch ? sqlActionMatch[1] : 'UNKNOWN_ACTION';

        transaction.executeSql(
          ddlSql,
          [],
          (tx, results) => {
            selfRef.logMessage(`${actionVerb} ${objectType} '${selfRef.shortIdentifier}.${objectName}' executed successfully.`);
            if (objectType.toUpperCase() === 'TABLE' && objectDefinition.records && objectDefinition.records.length > 0) {
              populateDataTable(tx, objectName, objectDefinition);
            }
          },
          selfRef.handleOperationError
        );
      };

      /**
       * Removes a database object if it exists.
       * @param {SQLTransaction} transaction - The active SQL transaction.
       * @param {string} objectType - Type of database object.
       * @param {string} objectName - Name of the object to drop.
       * @param {object|null} [recreateDefinition=null] - If provided, the object is recreated after dropping.
       */
      const removeDatabaseObject = (transaction, objectType, objectName, recreateDefinition = null) => {
        const dropSql = `DROP ${objectType} IF EXISTS ${objectName};`;
        transaction.executeSql(
          dropSql,
          [],
          (tx, results) => {
            selfRef.logMessage(`Dropped ${objectType} '${selfRef.shortIdentifier}.${objectName}'.`);
            if (recreateDefinition) {
              applyDDLStatement(tx, objectType, objectName, recreateDefinition);
            }
          },
          selfRef.handleOperationError
        );
      };

      /**
       * Ensures localStorage and sessionStorage objects exist based on schema definition.
       * @param {string} dbShortName - Short name of the database for prefixing.
       * @param {object} storageConfigData - Configuration for local/session storage.
       */
      const provisionWebStorage = (dbShortName, storageConfigData) => {
        if (!storageConfigData) return;

        const setStorageItems = (prefix, storageRef, items) => {
          if (!items) return;
          Object.keys(items).forEach(key => {
            const prefixedKey = `${prefix}_${key}`;
            if (!(prefixedKey in storageRef)) {
              try {
                storageRef.setItem(prefixedKey, items[key]);
                selfRef.logMessage(`Web Storage item '${prefixedKey}' added.`);
              } catch (e) {
                selfRef.handleOperationError(null, null, `Failed to set storage item '${prefixedKey}': ${e.message}`);
              }
            }
          });
        };

        const dbPrefix = dbShortName.toLowerCase();
        setStorageItems(dbPrefix, localStorage, storageConfigData.local);
        setStorageItems(dbPrefix, sessionStorage, storageConfigData.session);
      };

      /**
       * Clears localStorage and sessionStorage items associated with the database.
       * @param {string} dbShortName - Short name of the database for prefixing.
       * @param {object} storageConfigData - Configuration for local/session storage.
       */
      const purgeWebStorage = (dbShortName, storageConfigData) => {
        if (!storageConfigData) return;

        const removeStorageItems = (prefix, storageRef) => {
          const keysToRemove = [];
          for (let i = 0; i < storageRef.length; i++) {
            const key = storageRef.key(i);
            if (key && key.toLowerCase().startsWith(`${prefix}_`)) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => {
            try {
              storageRef.removeItem(key);
              selfRef.logMessage(`Web Storage item '${key}' removed.`);
            } catch (e) {
              selfRef.handleOperationError(null, null, `Failed to remove storage item '${key}': ${e.message}`);
            }
          });
        };

        const dbPrefix = dbShortName.toLowerCase();
        removeStorageItems(dbPrefix, localStorage);
        removeStorageItems(dbPrefix, sessionStorage);
      };

      /**
       * Opens the Web SQL Database connection.
       * @param {string} shortId - Short identifier for the database.
       * @param {string} currentVersion - Current version of the database.
       * @param {string} longId - Long identifier/display name.
       * @param {number} maxBytes - Maximum size in bytes.
       * @returns {boolean} True if database opened successfully, false otherwise.
       */
      const establishDatabaseConnection = (shortId, currentVersion, longId, maxBytes) => {
        if (!shortId || !longId || !maxBytes) {
          selfRef.handleOperationError(null, null, `Database connection parameters invalid: shortName='${shortId}', longName='${longId}', maxSize='${maxBytes}'.`);
          return false;
        }

        try {
          selfRef.databaseHandle = window.openDatabase(shortId, '', longId, maxBytes);
        } catch (error) {
          selfRef.handleOperationError(null, null, `Failed to open database '${shortId}'. Encountered system error: ${error.message}.`);
          return false;
        }

        if (selfRef.databaseHandle) {
          selfRef.shortIdentifier = shortId;
          selfRef.schemaVersion = selfRef.databaseHandle.version;
          selfRef.fullIdentifier = longId;
          selfRef.storageCapacity = maxBytes;
          selfRef.logMessage(`Database '${selfRef.shortIdentifier}' opened. Version: ${selfRef.schemaVersion}, Capacity: ${selfRef.storageCapacity} bytes (~${(selfRef.storageCapacity / (1024 * 1024)).toFixed(3)} MB).`);
          return true;
        } else {
          selfRef.handleOperationError(null, null, `Failed to obtain a database handle for '${shortId}'.`);
          return false;
        }
      };

      /**
       * Handles initial setup or full schema reset.
       * @param {object} schemaDefinition - The full schema definition object.
       * @param {object} webStorageDefinition - The web storage configuration.
       */
      const resetOrInitializeSchema = (schemaDefinition, webStorageDefinition) => {
        selfRef.logMessage('Performing schema reset or initial setup.');
        purgeWebStorage(schemaDefinition.shortName, webStorageDefinition);
        provisionWebStorage(schemaDefinition.shortName, webStorageDefinition);

        let exclusionList = ['"table__WebKitDatabaseInfoTable__"']; // Always exclude this internal table

        // Build a list of objects to exclude from generic DROP ALL operations
        const addExclusions = (category, typePrefix) => {
          if (schemaDefinition[category]) {
            Object.values(schemaDefinition[category]).forEach(objDef => {
              const objName = objDef.sql ? objDef.sql.match(sqlSyntaxParser)?.[3] : objDef.name;
              if (objName) {
                exclusionList.push(`"${typePrefix}${objName}"`);
              }
            });
          }
        };

        addExclusions('tables', 'TABLE');
        addExclusions('indices', 'INDEX');
        addExclusions('triggers', 'TRIGGER');
        addExclusions('views', 'VIEW');

        const exclusionClause = `AND upper(type)||name NOT IN(${exclusionList.join(',')})`;

        selfRef.databaseHandle.transaction(
          tx => {
            // Step 1: Drop all existing user-defined objects not in the new schema
            tx.executeSql(
              `SELECT upper(type) AS type, name FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ${exclusionClause};`,
              [],
              (txInner, resultSet) => {
                const itemsToDrop = Array.from({
                  length: resultSet.rows.length
                }, (_, i) => resultSet.rows.item(i));
                itemsToDrop.forEach(item => {
                  removeDatabaseObject(txInner, item.type, item.name);
                });
              },
              selfRef.handleOperationError
            );
          },
          selfRef.handleOperationError,
          () => {
            // Step 2: Drop and recreate objects defined in the new schema
            selfRef.databaseHandle.transaction(
              tx => {
                const processCategory = (categoryName, objType) => {
                  if (schemaDefinition[categoryName]) {
                    Object.values(schemaDefinition[categoryName]).forEach(objDef => {
                      const objName = objDef.sql ? objDef.sql.match(sqlSyntaxParser)?.[3] || objDef.name : objDef.name;
                      removeDatabaseObject(tx, objType, objName, objDef); // Drop and then recreate
                    });
                  }
                };

                processCategory('tables', 'TABLE');
                processCategory('indices', 'INDEX');
                processCategory('triggers', 'TRIGGER');
                processCategory('views', 'VIEW');
              },
              selfRef.handleOperationError,
              () => {
                // Step 3: Update database version
                selfRef.databaseHandle.changeVersion(
                  selfRef.databaseHandle.version,
                  schemaDefinition.version,
                  () => {
                    selfRef.logMessage(`Database version updated from '${selfRef.schemaVersion}' to '${schemaDefinition.version}'.`);
                  },
                  error => {
                    selfRef.handleOperationError(null, null, `Failed to change database version: ${error.message}.`);
                  },
                  () => {
                    selfRef.schemaVersion = selfRef.databaseHandle.version;
                    selfRef.isStoreReady = true;
                    selfRef.logMessage(`Database '${selfRef.shortIdentifier}', version '${selfRef.schemaVersion}', is fully initialized.`);
                  }
                );
              }
            );
          }
        );
      };

      /**
       * Handles schema upgrades based on the 'upgrades' object in the JSON definition.
       * (Currently a placeholder, as per original code's "under construction" comment).
       * @param {object} schemaDefinition - The full schema definition object.
       * @param {object} webStorageDefinition - The web storage configuration.
       */
      const applySchemaUpgrades = (schemaDefinition, webStorageDefinition) => {
        selfRef.logMessage('Schema upgrade functionality is under development. No upgrades applied.');
        // In a real implementation, this would involve iterating through schemaDefinition.upgrades
        // and executing relevant DDL/DML based on version differences.
        selfRef.isStoreReady = true;
        selfRef.logMessage(`Database '${selfRef.shortIdentifier}', version '${selfRef.schemaVersion}', is ready without upgrades.`);
      };

      /**
       * Loads schema data from a JSON object or URL, then proceeds with database setup.
       * @param {object|null} schemaObj - Direct JSON schema object.
       * @param {string|null} schemaUrl - URL to a JSON schema file.
       */
      const loadSchemaData = (schemaObj, schemaUrl) => {
        let rawJsonPayload = null;
        let jsonLoadSuccess = false;

        const processLoadedSchema = () => {
          if (!jsonLoadSuccess || !rawJsonPayload) {
            selfRef.handleOperationError(null, null, 'Schema data could not be processed.');
            return;
          }

          if (!('openDatabase' in window)) {
            selfRef.handleOperationError(null, null, 'Error: Web SQL Database API is not supported on this browser/platform.');
            return;
          }

          schemaDataBundle = rawJsonPayload.database;
          storageConfig = rawJsonPayload.storage;

          if (!schemaDataBundle) {
            selfRef.handleOperationError(null, null, 'Schema definition missing "database" root object.');
            return;
          }

          if (establishDatabaseConnection(schemaDataBundle.shortName, schemaDataBundle.version, schemaDataBundle.longName, schemaDataBundle.maxSize)) {
            const currentDbVersion = selfRef.schemaVersion || ''; // Handle empty string for new DBs
            const targetDbVersion = schemaDataBundle.version;

            if (selfRef.moduleSettings.forceReset || currentDbVersion === '') {
              selfRef.moduleSettings.forceReset = true; // Ensure flag is set for subsequent actions
              resetOrInitializeSchema(schemaDataBundle, storageConfig);
            } else if (targetDbVersion > currentDbVersion) {
              applySchemaUpgrades(schemaDataBundle, storageConfig);
            } else {
              selfRef.isStoreReady = true;
              selfRef.logMessage(`Database '${selfRef.shortIdentifier}', version '${selfRef.schemaVersion}', is already up-to-date and ready.`);
            }
          }
        };

        const handleXhrResponse = (xhr) => {
          if (!xhr || xhr.status !== 200) {
            selfRef.handleOperationError(null, null, `JSON load error from '${schemaUrl}': Status ${xhr.status} - ${xhr.statusText}.`);
            return;
          }
          selfRef.logMessage(`JSON schema file '${schemaUrl}' successfully retrieved.`);
          try {
            rawJsonPayload = JSON.parse(xhr.responseText);
            jsonLoadSuccess = true;
          } catch (jsonErr) {
            selfRef.handleOperationError(null, null, `Failed to parse JSON from '${schemaUrl}': ${jsonErr.message}.`);
            jsonLoadSuccess = false;
          }
        };

        if (schemaUrl) {
          const xhrRequest = new XMLHttpRequest();
          xhrRequest.open("GET", schemaUrl, selfRef.moduleSettings.asyncSchemaLoad);
          xhrRequest.responseType = 'text'; // Explicitly set response type for older browsers

          if (selfRef.moduleSettings.asyncSchemaLoad) {
            xhrRequest.onreadystatechange = () => {
              if (xhrRequest.readyState === XMLHttpRequest.DONE) {
                handleXhrResponse(xhrRequest);
                processLoadedSchema();
              }
            };
          }

          try {
            xhrRequest.send(null);
            if (!selfRef.moduleSettings.asyncSchemaLoad) {
              handleXhrResponse(xhrRequest);
              processLoadedSchema();
            }
          } catch (sendErr) {
            selfRef.handleOperationError(null, null, `XHR send error for '${schemaUrl}': ${sendErr.message}.`);
          }
        } else if (schemaObj) {
          rawJsonPayload = schemaObj;
          jsonLoadSuccess = true;
          processLoadedSchema();
        } else {
          selfRef.handleOperationError(null, null, 'No schema object or file path provided for loading.');
        }
      };

      // Determine schema source and initiate loading
      const hasSchemaFile = typeof selfRef.moduleSettings.schemaSourcePath === 'string' && selfRef.moduleSettings.schemaSourcePath.length > 0;
      const hasSchemaObject = typeof selfRef.moduleSettings.schemaDefinitionObject === 'object' && selfRef.moduleSettings.schemaDefinitionObject !== null;

      if (hasSchemaFile || hasSchemaObject) {
        loadSchemaData(selfRef.moduleSettings.schemaDefinitionObject, selfRef.moduleSettings.schemaSourcePath);
      } else {
        selfRef.handleOperationError(null, null, 'Configuration error: Neither "schemaSourcePath" nor "schemaDefinitionObject" is defined.');
      }
    },

    /**
     * Dumps the current database schema, including Web Storage items,
     * into a JSON-serializable object.
     */
    exportCurrentSchema: function() {
      const selfRef = this; // Consistent 'this' reference
      const exportedJson = {};
      const localStoreItems = [];
      const sessionStoreItems = [];
      const dbTables = [];
      const dbIndices = [];
      const dbTriggers = [];
      const dbViews = [];

      selfRef.isSchemaDefined = false; // Mark schema as not ready until export is complete

      // Helper to extract Web Storage items
      const retrieveWebStorage = (storageRef, storageType) => {
        const collectedItems = {};
        const dbPrefix = selfRef.shortIdentifier ? `${selfRef.shortIdentifier.toLowerCase()}_` : '';
        let hasItems = false;

        for (let i = 0; i < storageRef.length; i++) {
          const key = storageRef.key(i);
          if (key && key.toLowerCase().startsWith(dbPrefix)) {
            const originalKey = key.substring(dbPrefix.length);
            collectedItems[originalKey] = storageRef.getItem(key);
            hasItems = true;
          }
        }
        return hasItems ? collectedItems : null;
      };

      // Begin building the export object metadata
      exportedJson.generationTimestamp = new Date().toISOString();
      exportedJson.generatorAgent = navigator.userAgent;

      // Collect Web Storage data
      const localData = retrieveWebStorage(localStorage, 'local');
      const sessionData = retrieveWebStorage(sessionStorage, 'session');

      if (localData || sessionData) {
        exportedJson.storage = {};
        if (localData) {
          exportedJson.storage.local = localData;
        }
        if (sessionData) {
          exportedJson.storage.session = sessionData;
        }
      }

      // Proceed with database schema dump if a database is open
      if ('openDatabase' in window && selfRef.databaseHandle && selfRef.storageCapacity > 0 && selfRef.schemaVersion !== '') {
        exportedJson.database = {
          shortName: selfRef.shortIdentifier,
          version: selfRef.schemaVersion,
          longName: selfRef.fullIdentifier,
          maxSize: selfRef.storageCapacity
        };

        selfRef.databaseHandle.readTransaction(
          tx => {
            tx.executeSql(
              `SELECT type, name, sql FROM sqlite_master WHERE name != '__WebKitDatabaseInfoTable__' AND name NOT LIKE 'sqlite_%' ORDER BY type, name;`,
              [],
              (txInner, resultSet) => {
                const schemaItems = Array.from({
                  length: resultSet.rows.length
                }, (_, i) => resultSet.rows.item(i));

                const extractColumnsFromSql = (sqlString) => {
                  const columns = {};
                  const match = sqlString.match(/\(([^)]+)\)/); // Extract content inside parentheses
                  if (match && match[1]) {
                    const columnDefs = match[1].split(/,\s*(?![^()]*\))/); // Split by comma, but not inside parentheses
                    columnDefs.forEach(def => {
                      const parts = def.trim().split(/\s+/);
                      if (parts.length >= 2) {
                        const colName = parts[0];
                        const colType = parts.slice(1).join(' ');
                        columns[colName] = colType;
                      }
                    });
                  }
                  return columns;
                };

                const dumpTableData = (tableItem, callback) => {
                  txInner.executeSql(
                    `SELECT * FROM ${tableItem.name};`,
                    [],
                    (txData, dataResultSet) => {
                      const records = [];
                      for (let i = 0; i < dataResultSet.rows.length; i++) {
                        const row = dataResultSet.rows.item(i);
                        records.push(Object.assign({}, row)); // Clone the row object
                      }
                      tableItem.records = records;
                      callback();
                    },
                    (error) => {
                      selfRef.handleOperationError(null, error, `Failed to dump data for table '${tableItem.name}'.`);
                      callback(); // Continue even on error
                    }
                  );
                };

                let pendingTableDumps = 0;
                const tableDumpCallback = () => {
                  pendingTableDumps--;
                  if (pendingTableDumps === 0) {
                    finalizeSchemaExport();
                  }
                };

                schemaItems.forEach(item => {
                  const cleanedSql = item.sql.replace(/\s{2,}/g, ' ').trim();
                  const parsedMatch = cleanedSql.match(sqlSyntaxParser);
                  const objectName = parsedMatch?.[3] || item.name;

                  const schemaObject = {
                    name: objectName,
                    sql: cleanedSql
                  };

                  if (item.type.toUpperCase() === 'TABLE') {
                    schemaObject.columns = extractColumnsFromSql(cleanedSql);
                    dbTables.push(schemaObject);
                    pendingTableDumps++;
                    dumpTableData(schemaObject, tableDumpCallback);
                  } else if (item.type.toUpperCase() === 'INDEX') {
                    dbIndices.push(schemaObject);
                  } else if (item.type.toUpperCase() === 'TRIGGER') {
                    dbTriggers.push(schemaObject);
                  } else if (item.type.toUpperCase() === 'VIEW') {
                    dbViews.push(schemaObject);
                  }
                });

                // If no tables to dump data, finalize immediately
                if (pendingTableDumps === 0) {
                  finalizeSchemaExport();
                }

              },
              selfRef.handleOperationError
            );
          },
          selfRef.handleOperationError,
          () => {
            // Transaction success (outer transaction)
            if (dbTables.length === 0 && dbIndices.length === 0 && dbTriggers.length === 0 && dbViews.length === 0) {
              finalizeSchemaExport(); // Finalize if no database objects exist
            }
          }
        );
      } else {
        finalizeSchemaExport(); // Finalize if database is not open
      }

      // Finalize and store the schema
      const finalizeSchemaExport = () => {
        if (dbTables.length > 0) {
          exportedJson.database.tables = dbTables;
        }
        if (dbIndices.length > 0) {
          exportedJson.database.indices = dbIndices;
        }
        if (dbTriggers.length > 0) {
          exportedJson.database.triggers = dbTriggers;
        }
        if (dbViews.length > 0) {
          exportedJson.database.views = dbViews;
        }

        selfRef.currentSchemaDef = exportedJson;
        selfRef.isSchemaDefined = true;
        selfRef.logMessage('Schema export complete and stored in `currentSchemaDef`.');
      };
    }
  };

  // Expose the constructor globally
  window.SchemaVault = SchemaVault;
})();