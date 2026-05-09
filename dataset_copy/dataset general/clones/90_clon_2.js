/*
  DataBridge.js

  Offers a programmatic interface to HTML 5 web storage facilities

  This software is made available under the MIT License.

  Copyright (c) 2011 Daniel J. Pinter, http://DataZombies.com/

  Permission is granted, free of charge, to any individual obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is provided to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT ANY WARRANTY OF ANY KIND, EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
/*jslint devel: true, bitwise: true, regexp: true, sloppy: true, white: true, nomen: true, plusplus: true, maxerr: 50, indent: 2 */
(function () {
  // Main class definition
  var DataBridge = function (configParams) {
      var idx, selfRef = this;

      selfRef.dataStore = {};
      selfRef.issueReport = null;
      selfRef.isReady = false;
      selfRef.fullDesignation = null;
      selfRef.capacityLimit = null;
      selfRef.dataModel = {};
      selfRef.modelPrepared = false;
      selfRef.briefLabel = null;
      selfRef.revisionNum = null;
      selfRef.configParams = {
        verboseLog: false,
        asyncJsonLoad: false,
        forceRefresh: false,
        modelFilePath: null,
        modelStructure: null
      };

      // Incorporate user-defined configurations
      for (idx in configParams) {
        if (configParams.hasOwnProperty(idx)) {
          selfRef.configParams[idx] = configParams[idx];
        }
      }
      selfRef.beginSetup();
  },
  sqlPatternMatcher = /(ALTER|CREATE|UPDATE)\s+(?:(?:UNIQUE\s+)?(INDEX|TABLE|TRIGGER|VIEW)\s+(?:IF\s+NOT\s+EXISTS\s+)?)?(?:(?:OR\s+(?:ABORT|FAIL|IGNORE|REPLACE|ROLLBACK)\s+))?(\w+)\s*(?:\((.*)\))?/i,
  tableConstraintPattern = /,\s?((?:CHECK|FOREIGN\s+KEY|PRIMARY\s+KEY|UNIQUE).*)/i;

  // Prototype methods for DataBridge
  DataBridge.prototype = {
    // ************************************************************************************
    // _logMessage ()
    // If verbose logging is enabled, output a string to the console.
    // ************************************************************************************
    _logMessage: function (msgContent) {
      if (this.configParams.verboseLog) {
        console.log(msgContent);
      }
    },

    //************************************************************************************
    // _handleProblem ()
    // Sends an error message to the console, irrespective of the verboseLog setting.
    //************************************************************************************
    _handleProblem: function (errObj, sqlErrObj, displayMsg) {
      if (errObj !== null && typeof (sqlErrObj) === 'undefined') {
        if (-1 !== errObj.message.indexOf('callback did not return false')) {
          return true;
        }
        displayMsg = 'Transaction Issue ' + errObj.code + ' - ' + errObj.message;
      } else if (sqlErrObj !== null) {
        displayMsg = 'SQL Query Issue ' + sqlErrObj.code + ' - ' + sqlErrObj.message;
      }
      this.issueReport = displayMsg;
      console.log('##########\n# ' + displayMsg + '\n##########');
      return true;
    },


    //************************************************************************************
    // beginSetup ()
    // Initializes, creates, populates, and/or upgrades a database in a single transaction
    // using a JSON file or object.
    //************************************************************************************
    beginSetup: function () {
      var dbConfigData, parsedData, storageConfigData, selfRef = this,

        // Inserts data rows into a given table
        fillTableData = function (transObj, tableName, tableDetails) {
          var valueArray, recIdx = tableDetails.records.length - 1, propKey, columnString, valuePlaceholder;
          for (recIdx; recIdx >= 0; --recIdx) {
            valueArray = [];
            columnString = '';
            valuePlaceholder = '';
            for (propKey in tableDetails.records[recIdx]) {
              if (tableDetails.records[recIdx].hasOwnProperty(propKey)) {
                valueArray.push(tableDetails.records[recIdx][propKey]);
                columnString += propKey + ', ';
                valuePlaceholder += '?, ';
              }
            }
            transObj.executeSql(
              'INSERT INTO ' + tableName + ' (' + columnString.substr(0, columnString.lastIndexOf(', ')) + ') VALUES (' + valuePlaceholder.substr(0, valuePlaceholder.lastIndexOf(', ')) + ');',
              valueArray,
              null,
              selfRef._handleProblem
            );
          }
          selfRef._logMessage('Table ' + selfRef.briefLabel + '.' +  tableName + ' populated with data.');
        },

        // Creates indices, tables, triggers, and views
        performDDL = function (transObj, objType, objName, objDefinition) {
          var sqlAction, colIdx, statementText;
          if (typeof (objDefinition.sql) !== 'undefined') {
            statementText = objDefinition.sql;
          } else {
            statementText = 'CREATE ' + objType + ' IF NOT EXISTS ' + objDefinition.name + ' (';
            for (colIdx in objDefinition.columns) {
              if (objDefinition.columns.hasOwnProperty(colIdx)) {
                statementText += colIdx + ' ' + objDefinition.columns[colIdx] + ', ';
              }
            }
            statementText = statementText.substr(0, statementText.lastIndexOf(', ')) + (typeof (objDefinition.tableConstraint) !== 'undefined' ? ', ' + objDefinition.tableConstraint : '') + ');';
          }
          sqlAction = statementText.match(sqlPatternMatcher)[1];
          transObj.executeSql(
            statementText,
            [],
            function (t, r) {
              selfRef._logMessage(sqlAction + ' ' + objType + ' ' + selfRef.briefLabel + '.' + objName + ' created.');
              if (typeof (objDefinition.records) !== 'undefined' && objDefinition.records.length > 0) {
                fillTableData(t, objName, objDefinition);
              }
            },
            selfRef._handleProblem
          );
        },

        // Removes database objects
        deleteDbObject = function (transObj, objKind, objIdentifier, objToRecreate) {
          transObj.executeSql(
            'DROP ' + objKind + ' IF EXISTS ' + objIdentifier + ';',
            [],
            function (t, r) {
              selfRef._logMessage('DROP ' + objKind + ' ' + selfRef.briefLabel + '.' + objIdentifier + ' completed.');
              if (typeof (objToRecreate) !== 'undefined' && objToRecreate !== null) {
                performDDL(t, objKind, objIdentifier, objToRecreate);
              }
            },
            selfRef._handleProblem
          );
        },

        // Creates localStorage and sessionStorage items if they don't already exist
        generateStorageItems = function (dbShortId, storageConfig) {
          var createItem = function (prefixVal, storageRef, jsonMap) {
                var keyName, fullKey;
                for (keyName in jsonMap) {
                  if (jsonMap.hasOwnProperty(keyName)) {
                    fullKey = prefixVal + '_' + keyName;
                    if (!(fullKey in storageRef)) {
                      storageRef[fullKey] = jsonMap[keyName];
                      selfRef._logMessage('Storage item ' + fullKey + ' added with value "' + jsonMap[keyName] + '".');
                    }
                  }
                }
              };
          if (typeof (storageConfig) !== 'undefined') {
            createItem(dbShortId, localStorage, storageConfig.local);
            createItem(dbShortId, sessionStorage, storageConfig.session);
          }
        },

        // Deletes localStorage and sessionStorage items
        removeStorageItems = function (dbShortId, storageConfig) {
          var deleteItem = function (prefixVal, storageRef) {
                var keyName;
                for (keyName in storageRef) {
                  if (storageRef.hasOwnProperty(keyName)) {
                    if (keyName.substr(0, prefixVal.length + 1).toLowerCase() === prefixVal.toLowerCase() + '_') {
                      delete storageRef[keyName];
                      selfRef._logMessage('Storage item ' + keyName + ' deleted.');
                    }
                  }
                }
              };
          deleteItem(dbShortId, localStorage);
          deleteItem(dbShortId, sessionStorage);
        },

        // Opens a database connection
        establishDatabaseConnection = function (shortId, verNum, longId, maxCapacity) {
          if (shortId === null || shortId === '' || longId === null || longId === '' || maxCapacity === null || maxCapacity === '') {
            selfRef._handleProblem(null, null, 'Error - Database attributes are invalid\n  briefLabel: ' + shortId + '\n  fullDesignation: ' + longId + '\n  capacityLimit: ' + maxCapacity + '.');
            return false;
          }
          try {
            selfRef.dataStore = openDatabase(shortId, '', longId, maxCapacity);
          } catch (err) {
            selfRef._handleProblem(null, null, 'Error - Database failed to open. Unidentified error ' + err + '.');
            return false;
          }
          if (typeof (selfRef.dataStore) !== 'undefined') {
            selfRef.briefLabel = shortId;
            selfRef.revisionNum = selfRef.dataStore.version;
            selfRef.fullDesignation = longId;
            selfRef.capacityLimit = maxCapacity;
            selfRef._logMessage('Database ' + selfRef.briefLabel + ' successfully opened.\n  revisionNum: ' + selfRef.revisionNum + '\n  fullDesignation: ' + selfRef.fullDesignation + '\n  capacityLimit: ' + selfRef.capacityLimit + ' bytes (' + ~~ ((selfRef.capacityLimit / 10488576 * 1000) + 0.5) / 1000 + ' MB)');
            return true;
          } else {
            selfRef._handleProblem(null, null, 'Error - Failed to establish the database connection.');
            return false;
          }
        },

        // Called on initial application run or when a reset is requested
        resetOrCreateSchema = function (dbDefinition, storageSchema) {
          var excludedItems = '', objCategory, itemKey, itemKind = '';
          selfRef._logMessage('Resetting or creating new schema.');
          removeStorageItems(dbDefinition.briefLabel, storageSchema);
          generateStorageItems(dbDefinition.briefLabel, storageSchema);
          for (objCategory in dbDefinition) {
            if (dbDefinition.hasOwnProperty(objCategory) && objCategory !== 'upgrades') {
              itemKind = (objCategory === 'indices' ? 'index' : objCategory.substr(0, objCategory.length - 1));
              for (itemKey in dbDefinition[objCategory]) {
                if (dbDefinition[objCategory].hasOwnProperty(itemKey)) {
                  excludedItems += ',"' + itemKind + dbDefinition[objCategory][itemKey].name + '"';
                }
              }
            }
          }
          selfRef.dataStore.transaction(
            function (transObj) {
              transObj.executeSql(
                'SELECT upper(type) kind, name identifier FROM sqlite_master WHERE type||name Not In("table__WebKitDatabaseInfoTable__"' + excludedItems + ') AND name NOT LIKE "sqlite_%"',
                [],
                function (t, res) {
                  var objCategory = res.rows.length - 1;
                  if (res.rows.length !== -1) {
                    for (objCategory; objCategory >= 0; --objCategory) {
                      deleteDbObject(t, res.rows.item(objCategory).kind, res.rows.item(objCategory).identifier, null);
                    }
                  }
                },
                selfRef._handleProblem
              );
            },
            selfRef._handleProblem,
            function () {
              selfRef.dataStore.transaction(
                function (transObj) {
                  var objCategory, getObjectName = function (definitionObj) {
                      var objectName, sqlText;
                      if (typeof (definitionObj.sql) !== 'undefined') {
                        sqlText = definitionObj.sql.replace(/\s{2,}/g, ' ');
                        objectName = definitionObj.sql.match(sqlPatternMatcher)[3];
                      } else {
                        objectName = definitionObj.name;
                      }
                      return objectName;
                    };
                  for (objCategory in dbDefinition.tables) {
                    if (dbDefinition.tables.hasOwnProperty(objCategory)) {
                      deleteDbObject(transObj, 'Table', getObjectName(dbDefinition.tables[objCategory]), dbDefinition.tables[objCategory]);
                    }
                  }
                  for (objCategory in dbDefinition.indices) {
                    if (dbDefinition.indices.hasOwnProperty(objCategory)) {
                      deleteDbObject(transObj, 'Index', getObjectName(dbDefinition.indices[objCategory]), dbDefinition.indices[objCategory]);
                    }
                  }
                  for (objCategory in dbDefinition.triggers) {
                    if (dbDefinition.triggers.hasOwnProperty(objCategory)) {
                      deleteDbObject(transObj, 'Trigger', getObjectName(dbDefinition.triggers[objCategory]), dbDefinition.triggers[objCategory]);
                    }
                  }
                  for (objCategory in dbDefinition.views) {
                    if (dbDefinition.views.hasOwnProperty(objCategory)) {
                      deleteDbObject(transObj, 'View', getObjectName(dbDefinition.views[objCategory]), dbDefinition.views[objCategory]);
                    }
                  }
                },
                selfRef._handleProblem,
                function () {
                  selfRef.dataStore.changeVersion(
                    selfRef.dataStore.version,
                    dbDefinition.version,
                    function (t) {},      // success callback
                    function (err) {},    // error callback
                    function () {         // final success callback
                      selfRef.revisionNum = selfRef.dataStore.version;
                      selfRef.isReady = true;
                      selfRef._logMessage(selfRef.briefLabel + ', revision ' + selfRef.revisionNum +', is now fully operational.');
                    }
                  );
                }
              );
            }
          );
        },

        // Performs schema upgrades and record updates when an "upgrades" object is present in the JSON configuration
        updateSchemaLogic = function (dbDefinition, storageSchema) {
          // Functionality under active development
        },

        // Loads a JSON object or file asynchronously/synchronously based on the 'asyncJsonLoad' setting
        loadSchemaData = function (schemaObjectInput, schemaUrlInput) {
          var xhrRequest = new XMLHttpRequest(),
              dataLoadedSuccessfully = false,
              processParsedData = function () {
                if (dataLoadedSuccessfully) {
                  if ('openDatabase' in window) {
                    dbConfigData = xhrRequest.database;
                    storageConfigData = xhrRequest.storage;
                    if (establishDatabaseConnection(dbConfigData.shortName, dbConfigData.version, dbConfigData.longName, dbConfigData.maxSize)) {
                      if (selfRef.configParams.forceRefresh || selfRef.revisionNum === '') {
                        selfRef.configParams.forceRefresh = true;
                        resetOrCreateSchema(dbConfigData, storageConfigData);
                      } else {
                        if (dbConfigData.version > selfRef.revisionNum && selfRef.revisionNum !== '') {
                          //updateSchemaLogic(dbConfigData, storageConfigData);
                          // This section is still in progress
                        } else {
                          selfRef.isReady = true;
                          selfRef._logMessage('Same revision, no forced refresh - simply opening the database.');
                          selfRef._logMessage(selfRef.briefLabel + ', revision ' + selfRef.revisionNum +', is now fully operational.');
                        }
                      }
                    }
                  } else {
                    selfRef._handleProblem(null, null, 'Error - Web SQL Databases are not supported on this operating platform.');
                  }
                }
              },
              handleResponse = function () {
                if (!xhrRequest || xhrRequest === null || xhrRequest.status !== 200) {
                  selfRef._handleProblem(null, null, 'JSON Issue ' + xhrRequest.status + ' - file "' + schemaUrlInput + '" ' + xhrRequest.statusText + '.');
                } else {
                  selfRef._logMessage('JSON file "' + schemaUrlInput + '" successfully loaded.');
                  try {
                    xhrRequest = JSON.parse(xhrRequest.responseText);
                    dataLoadedSuccessfully = true;
                  } catch (err) {
                    selfRef._handleProblem(null, null, err);
                    dataLoadedSuccessfully = false;
                  }
                }
              };

          if(typeof (schemaUrlInput) !== 'undefined' && schemaUrlInput !== null) {
            xhrRequest.open("GET", schemaUrlInput, selfRef.configParams.asyncJsonLoad);
            try {
              xhrRequest.send(null);
            } catch (err) {
              selfRef._handleProblem(null, null, err);
              xhrRequest = null;
            }
            if (selfRef.configParams.asyncJsonLoad) {
              xhrRequest.onreadystatechange = function () {
                if (xhrRequest.readyState === 4) {
                  handleResponse();
                  processParsedData();
                }
              };
            } else {
              handleResponse();
              processParsedData();
            }
          } else {
            xhrRequest = schemaObjectInput;
            dataLoadedSuccessfully = true;
            processParsedData();
          }
        };

      if((typeof (selfRef.configParams.modelFilePath) !== 'undefined' && selfRef.configParams.modelFilePath !== null) ||
      (typeof (selfRef.configParams.modelStructure) !== 'undefined' && selfRef.configParams.modelStructure !== null)) {
        loadSchemaData(selfRef.configParams.modelStructure, selfRef.configParams.modelFilePath);
      } else {
        selfRef._handleProblem(null, null, 'Error - modelFilePath or modelStructure is not defined in configuration.');
      }
    },

    //************************************************************************************
    // exportDataModel ()
    // Dumps the current localStorage, sessionStorage, and database schema.
    // Based on "Abusing HTML 5 Structured Client-side Storage" by Alberto Trivero
    // (http://trivero.secdiscover.com/html5whitepaper.pdf)
    //************************************************************************************
    exportDataModel: function () {
      var indexDefinitions = [],
          exportedModel = {},
          localStoreData,
          sessionStoreData,
          tableStructures = [],
          selfRef = this,
          triggerDefinitions = [],
          viewDefinitions = [],

          // Retrieves data from localStorage and sessionStorage
          getStorageContent = function (storageSource) {
            var dbShortIdPrefix = selfRef.briefLabel.length !== 0 ? selfRef.briefLabel.toLowerCase() + '_' : '',
              keyIterator,
              extractedStorage = {isEmpty: true};
            for (keyIterator in storageSource) {
              if (storageSource.hasOwnProperty(keyIterator)) {
                if (keyIterator.substr(0, dbShortIdPrefix.length).toLowerCase() === dbShortIdPrefix) {
                  extractedStorage[keyIterator.substr(dbShortIdPrefix.length, keyIterator.length)] = storageSource.getItem(keyIterator);
                  extractedStorage.isEmpty = false;
                }
              }
            }
            return extractedStorage;
          },

          // Saves the database schema to the internal dataModel property
          saveModelToJSON = function (modelContent) {
            selfRef.dataModel = modelContent;
            selfRef.modelPrepared = true;
          };

      selfRef.modelPrepared = false;
      exportedModel.creationTimestamp = new Date();
      exportedModel.clientAgent = navigator.userAgent;

      // Obtain sessionStorage and localStorage details
      localStoreData = getStorageContent(localStorage);
      sessionStoreData = getStorageContent(sessionStorage);
      if (localStoreData.isEmpty === false || sessionStoreData.isEmpty === false) {
        exportedModel.storage = {};
        if (localStoreData.isEmpty === false) {
          delete localStoreData.isEmpty;
          exportedModel.storage.local = localStoreData;
        }
        if (sessionStoreData.isEmpty === false) {
          delete sessionStoreData.isEmpty;
          exportedModel.storage.session = sessionStoreData;
        }
      }
      // Begin extracting the schema if the database is accessible
      if ('openDatabase' in window) {
        if (selfRef.capacityLimit !== 0 && selfRef.dataStore.version !== '') {
          exportedModel.database = {
            shortName: selfRef.briefLabel,
            version: selfRef.revisionNum,
            longName: selfRef.fullDesignation,
            maxSize: selfRef.capacityLimit
          };
          selfRef.dataStore.transaction(
            function (transObj) {
              transObj.executeSql(
                'SELECT sql FROM sqlite_master WHERE name!="__WebKitDatabaseInfoTable__" AND name NOT LIKE "sqlite_%" ORDER BY 1 DESC;',
                [],
                function (t, result) {
                  var rowIterator, sqlString, currentTable = {},
                      extractTableData = function (t, tableObj) {
                        // Retrieve all records from the specified table
                        t.executeSql(
                          'SELECT * FROM ' + tableObj.name + ' ORDER BY 1 DESC;',
                          [],
                          function (transObj, resultRows) {
                            var rowIdx, colKey, rowData = [],
                              allRecords = [];
                            if (resultRows.length !== 0) {
                              for (rowIdx = resultRows.length - 1; rowIdx >= 0; --rowIdx) {
                                rowData = {};
                                for (colKey in resultRows.item(rowIdx)) {
                                  if (resultRows.item(rowIdx).hasOwnProperty(colKey)) {
                                    rowData[colKey] = resultRows.item(rowIdx)[colKey];
                                  }
                                }
                                allRecords.push(rowData);
                              }
                              tableObj.records = allRecords;
                            }
                          },
                          selfRef._handleProblem);
                      },
                      getColumnDefinitions = function (sqlStatement) {
                        // Parses column definitions from the SQL statement
                        var columnDefinitions = {},
                          propName, matchResult = [];
                        for (propName in sqlStatement) {
                          if (sqlStatement.hasOwnProperty(propName)) {
                            matchResult = sqlStatement[propName].match(/(\w+)\s+(.+)/);
                            columnDefinitions[matchResult[1]] = matchResult[2];
                          }
                        }
                        return columnDefinitions;
                      };

                    for (rowIterator = result.rows.length - 1; rowIterator >= 0; --rowIterator) {
                      sqlString = result.rows.item(rowIterator).sql.replace(/\s{2,}/g, ' ') + ';';
                      sqlString = sqlString.match(sqlPatternMatcher);
                      sqlString[0] = result.rows.item(rowIterator).sql.replace(/\s{2,}/g, ' ') + ';';
                      if (typeof (sqlString[4]) !== 'undefined') {