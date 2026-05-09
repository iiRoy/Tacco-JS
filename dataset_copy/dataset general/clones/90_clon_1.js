/*
 * DBi.js - Database Interface Module
 *
 * Provides a robust interface to HTML 5 database objects,
 * encapsulating common operations and schema management.
 *
 * This software is released under the MIT License.
 *
 * Copyright (c) 2011 Daniel J. Pinter, http://DataZombies.com/
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
 *
 */
/*
 * JSLint Configuration Directives:
 *   devel: true  - Allow development-related global variables (e.g., console).
 *   bitwise: true - Allow bitwise operators.
 *   regexp: true  - Allow regular expression literals.
 *   sloppy: true  - Allow 'use strict' to be omitted (non-strict mode).
 *   white: true   - Enforce whitespace rules (though we're modifying them for this clone).
 *   nomen: true   - Allow dangling underscores in identifiers.
 *   plusplus: true - Allow ++ and -- operators.
 *   maxerr: 50    - Maximum number of errors to report.
 *   indent: 2     - Preferred indentation width (overridden for clone).
 */
(function () {

    // DBi Constructor function definition
    var DBi = function (settings) {
        var i,
            that = this; // Cache 'this' for scope consistency

        // Initialize instance properties
        that.db             = {};
        that.error          = null;
        that.isInitialized  = false;
        that.longName       = null;
        that.maxSize        = null;
        that.schema         = {};
        that.schemaReady    = false;
        that.shortName      = null;
        that.version        = null;

        // Default settings for the DBi instance
        that.settings       = {
            debug:              false,
            jsonAsynchronous:   false,
            reset:              false,
            schemaFile:         null,
            schemaObject:       null
        };

        // Apply user-provided settings, overriding defaults
        for (i in settings) {
            if (settings.hasOwnProperty(i)) {
                that.settings[i] = settings[i];
            }
        }

        // Begin the initialization process for the database
        that.initialization();
    },

    // Regular expression to parse SQL DDL statements (ALTER, CREATE, UPDATE)
    regexParseSQL = /(ALTER|CREATE|UPDATE)\s+(?:(?:UNIQUE\s+)?(INDEX|TABLE|TRIGGER|VIEW)\s+(?:IF\s+NOT\s+EXISTS\s+)?)?(?:(?:OR\s+(?:ABORT|FAIL|IGNORE|REPLACE|ROLLBACK)\s+))?(\w+)\s*(?:\((.*)\))?/i,

    // Regular expression to extract table constraints from a CREATE TABLE statement
    regexTableConstraints = /,\s?((?:CHECK|FOREIGN\s+KEY|PRIMARY\s+KEY|UNIQUE).*)/i;


    // DBi Prototype methods definition
    DBi.prototype = {

        /*
         * _debug (a)
         *
         * This private method conditionally outputs a string to the console.
         * Output only occurs if the 'debug' setting is set to true.
         *
         * @param {string} a - The message string to be logged.
         */
        _debug: function (a) {
            if (this.settings.debug) {
                console.log(a);
            }
        },


        /*
         * _errorHandler (a, b, c)
         *
         * Handles database errors, logging them to the console
         * and storing the last error message.
         * This function logs errors irrespective of the debug setting.
         *
         * @param {object} a - Transaction error object or null.
         * @param {object} b - SQL error object or null.
         * @param {string} c - Custom error message (optional, for internal use).
         * @returns {boolean} Always returns true to indicate error handled.
         */
        _errorHandler: function (a, b, c) {
            // Check for a transaction error
            if (a !== null && typeof (b) === 'undefined') {
                // Special handling for a known WebSQL error message
                if (-1 !== a.message.indexOf('callback did not return false')) {
                    return true;
                }
                c = 'Transaction Error ' + a.code + ' - ' + a.message;
            } else if (b !== null) {
                // Handle a SQL error
                c = 'SQL Error ' + b.code + ' - ' + b.message;
            }
            // Store the error message and log it to the console
            this.error = c;
            console.log('**********\n* ' + c + '\n**********');
            return true;
        },


        /*
         * initialization ()
         *
         * Orchestrates the entire database initialization process.
         * This includes creating, populating, and/or upgrading the database
         * based on a provided JSON schema (from file or object).
         */
        initialization: function () {
            var jDB,
                json,
                jStorage,
                that = this, // Reference to the DBi instance

                /*
                 * populateTable (t, name, tbl)
                 *
                 * Inserts records into a specified table within a transaction.
                 *
                 * @param {SQLTransaction} t - The current database transaction.
                 * @param {string} name - The name of the table to populate.
                 * @param {object} tbl - The table object containing records data.
                 */
                populateTable = function (t, name, tbl) {
                    var arrVal, i = tbl.records.length - 1, j, strCol, strVal;
                    for (i; i >= 0; --i) {
                        arrVal = [];
                        strCol = '';
                        strVal = '';
                        for (j in tbl.records[i]) {
                            if (tbl.records[i].hasOwnProperty(j)) {
                                arrVal.push(tbl.records[i][j]);
                                strCol += j + ', ';
                                strVal += '?, ';
                            }
                        }
                        // Execute the INSERT SQL statement
                        t.executeSql(
                            'INSERT INTO ' + name + ' (' + strCol.substr(0, strCol.lastIndexOf(', ')) + ') VALUES (' + strVal.substr(0, strVal.lastIndexOf(', ')) + ');',
                            arrVal,
                            null,
                            that._errorHandler
                        );
                    }
                    that._debug('Table ' + that.shortName + '.' + name + ' populated.');
                },

                /*
                 * executeDDL (t, type, name, obj)
                 *
                 * Executes Data Definition Language (DDL) statements to create
                 * indices, tables, triggers, or views.
                 *
                 * @param {SQLTransaction} t - The current database transaction.
                 * @param {string} type - The type of object to create (e.g., 'TABLE', 'INDEX').
                 * @param {string} name - The name of the object.
                 * @param {object} obj - The object definition, potentially containing 'sql' or 'columns'.
                 */
                executeDDL = function (t, type, name, obj) {
                    var action, i, sql;
                    if (typeof (obj.sql) !== 'undefined') {
                        sql = obj.sql;
                    } else {
                        sql = 'CREATE ' + type + ' IF NOT EXISTS ' + obj.name + ' (';
                        for (i in obj.columns) {
                            if (obj.columns.hasOwnProperty(i)) {
                                sql += i + ' ' + obj.columns[i] + ', ';
                            }
                        }
                        sql = sql.substr(0, sql.lastIndexOf(', ')) + (typeof (obj.tableConstraint) !== 'undefined' ? ', ' + obj.tableConstraint : '') + ');';
                    }
                    action = sql.match(regexParseSQL)[1];
                    t.executeSql(
                        sql,
                        [],
                        function (t, r) {
                            that._debug(action + ' ' + type + ' ' + that.shortName + '.' + name + '.');
                            if (typeof (obj.records) !== 'undefined' && obj.records.length > 0) {
                                populateTable(t, name, obj);
                            }
                        },
                        that._errorHandler
                    );
                },

                /*
                 * dropObject (t, type, name, tbl)
                 *
                 * Removes a database object (table, index, trigger, view) if it exists.
                 * Optionally, it can then recreate the object if 'tbl' is provided.
                 *
                 * @param {SQLTransaction} t - The current database transaction.
                 * @param {string} type - The type of object to drop (e.g., 'TABLE').
                 * @param {string} name - The name of the object to drop.
                 * @param {object} tbl - Optional table object; if present, the object is recreated after dropping.
                 */
                dropObject = function (t, type, name, tbl) {
                    t.executeSql(
                        'DROP ' + type + ' IF EXISTS ' + name + ';',
                        [],
                        function (t, r) {
                            that._debug('DROP ' + type + ' ' + that.shortName + '.' + name + '.');
                            if (typeof (tbl) !== 'undefined' && tbl !== null) {
                                executeDDL(t, type, name, tbl);
                            }
                        },
                        that._errorHandler
                    );
                },

                /*
                 * createStorages (dbSN, jStorage)
                 *
                 * Creates localStorage and sessionStorage objects based on the
                 * provided JSON storage definition, if they don't already exist.
                 *
                 * @param {string} dbSN - The short name of the database.
                 * @param {object} jStorage - JSON object containing local and session storage data.
                 */
                createStorages = function (dbSN, jStorage) {
                    var newS = function (m, s, j) {
                            var i, n;
                            for (i in j) {
                                if (j.hasOwnProperty(i)) {
                                    n = m + '_' + i;
                                    if (!(n in s)) {
                                        s[n] = j[i];
                                        that._debug('Storage ' + n + ' added with value "' + j[i] + '".');
                                    }
                                }
                            }
                        };
                    if (typeof (jStorage) !== 'undefined') {
                        newS(dbSN, localStorage, jStorage.local);
                        newS(dbSN, sessionStorage, jStorage.session);
                    }
                },

                /*
                 * deleteStorage (dbSN, jStorage)
                 *
                 * Deletes localStorage and sessionStorage objects associated
                 * with the database's short name.
                 *
                 * @param {string} dbSN - The short name of the database.
                 * @param {object} jStorage - JSON object containing local and session storage data (used for reference).
                 */
                deleteStorage = function (dbSN, jStorage) {
                    var delS = function (n, s) {
                            var i;
                            for (i in s) {
                                if (s.hasOwnProperty(i)) {
                                    if (i.substr(0, n.length + 1).toLowerCase() === n.toLowerCase() + '_') {
                                        delete s[i];
                                        that._debug('Storage ' + i + ' deleted.');
                                    }
                                }
                            }
                        };
                    delS(dbSN, localStorage);
                    delS(dbSN, sessionStorage);
                },

                /*
                 * openDB (SN, V, LN, MS)
                 *
                 * Attempts to open an HTML5 WebSQL database.
                 *
                 * @param {string} SN - Short name of the database.
                 * @param {string} V - Version of the database (unused in openDatabase call).
                 * @param {string} LN - Long name of the database.
                 * @param {number} MS - Maximum size of the database in bytes.
                 * @returns {boolean} True if the database was successfully opened, false otherwise.
                 */
                openDB = function (SN, V, LN, MS) {
                    if (SN === null || SN === '' || LN === null || LN === '' || MS === null || MS === '') {
                        that._errorHandler(null, null, 'Error - Database attributes error\n  shortName: ' + SN + '\n  longName: ' + LN + '\n  maxSize: ' + MS + '.');
                        return false;
                    }
                    try {
                        that.db = openDatabase(SN, '', LN, MS);
                    } catch (err) {
                        that._errorHandler(null, null, 'Error - Database failed to open. Unknown error ' + err + '.');
                        return false;
                    }
                    if (typeof (that.db) !== 'undefined') {
                        that.shortName = SN;
                        that.version = that.db.version;
                        that.longName = LN;
                        that.maxSize = MS;
                        that._debug('Database ' + that.shortName + ' opened.\n  version: ' + that.version + '\n  longName: ' + that.longName + '\n  maxSize: ' + that.maxSize + ' bytes (' + ~~ ((that.maxSize / 10488576 * 1000) + 0.5) / 1000 + ' MB)');
                        return true;
                    } else {
                        that._errorHandler(null, null, 'Error - Failed to open the database.');
                        return false;
                    }
                },

                /*
                 * resetOrNewSchema (jDB, jStorage)
                 *
                 * Handles the initial creation or complete reset of the database schema.
                 * This involves dropping all existing objects and then recreating them
                 * based on the provided JSON schema.
                 *
                 * @param {object} jDB - JSON object containing database schema definition.
                 * @param {object} jStorage - JSON object containing storage data.
                 */
                resetOrNewSchema = function (jDB, jStorage) {
                    var exclusions = '', i, j, type = '';
                    that._debug('Resetting or creating new schema.');

                    // Delete and then create associated local and session storage objects
                    deleteStorage(jDB.shortName, jStorage);
                    createStorages(jDB.shortName, jStorage);

                    // Build a list of objects to exclude from the initial drop (i.e., those to be created)
                    for (i in jDB) {
                        if (jDB.hasOwnProperty(i) && i !== 'upgrades') {
                            type = (i === 'indices' ? 'index' : i.substr(0, i.length - 1));
                            for (j in jDB[i]) {
                                if (jDB[i].hasOwnProperty(j)) {
                                    exclusions += ',"' + type + jDB[i][j].name + '"';
                                }
                            }
                        }
                    }

                    // First transaction: Drop all objects not explicitly defined in the new schema
                    that.db.transaction(
                        function (t) {
                            t.executeSql(
                                'SELECT upper(type) type, name FROM sqlite_master WHERE type||name Not In("table__WebKitDatabaseInfoTable__"' + exclusions + ') AND name NOT LIKE "sqlite_%"',
                                [],
                                function (t, r) {
                                    var i = r.rows.length - 1;
                                    if (r.rows.length !== -1) {
                                        for (i; i >= 0; --i) {
                                            dropObject(t, r.rows.item(i).type, r.rows.item(i).name, null);
                                        }
                                    }
                                },
                                that._errorHandler
                            );
                        },
                        that._errorHandler,
                        function () {
                            // Second transaction: Drop and recreate objects defined in the new schema
                            that.db.transaction(
                                function (t) {
                                    var i,
                                        getName = function (obj) {
                                            var name, sql;
                                            if (typeof (obj.sql) !== 'undefined') {
                                                sql = obj.sql.replace(/\s{2,}/g, ' ');
                                                name = obj.sql.match(regexParseSQL)[3];
                                            } else {
                                                name = obj.name;
                                            }
                                            return name;
                                        };
                                    for (i in jDB.tables) {
                                        if (jDB.tables.hasOwnProperty(i)) {
                                            dropObject(t, 'Table', getName(jDB.tables[i]), jDB.tables[i]);
                                        }
                                    }
                                    for (i in jDB.indices) {
                                        if (jDB.indices.hasOwnProperty(i)) {
                                            dropObject(t, 'Index', getName(jDB.indices[i]), jDB.indices[i]);
                                        }
                                    }
                                    for (i in jDB.triggers) {
                                        if (jDB.triggers.hasOwnProperty(i)) {
                                            dropObject(t, 'Trigger', getName(jDB.triggers[i]), jDB.triggers[i]);
                                        }
                                    }
                                    for (i in jDB.views) {
                                        if (jDB.views.hasOwnProperty(i)) {
                                            dropObject(t, 'View', getName(jDB.views[i]), jDB.views[i]);
                                        }
                                    }
                                },
                                that._errorHandler,
                                function () {
                                    // Final step: Change the database version
                                    that.db.changeVersion(
                                        that.db.version,
                                        jDB.version,
                                        function (t) { /* Callback for successful version change step */ },
                                        function (err) { /* Error callback for version change */ },
                                        function () { // Success callback for version change
                                            that.version = that.db.version;
                                            that.isInitialized = true;
                                            that._debug(that.shortName + ', version ' + that.version + ', is initialized.');
                                        }
                                    );
                                }
                            );
                        }
                    );
                },

                /*
                 * upgradeSchema (jDB, jStorage)
                 *
                 * (Under Construction)
                 * This function is intended to handle schema upgrades
                 * when an 'upgrades' object is present in the JSON schema.
                 *
                 * @param {object} jDB - JSON object containing database schema definition.
                 * @param {object} jStorage - JSON object containing storage data.
                 */
                upgradeSchema = function (jDB, jStorage) {
                    // Current implementation is a placeholder; logic for upgrades needs to be added.
                    that._debug('upgradeSchema is under construction.');
                },

                /*
                 * AE_35 (jsonObj, jsonURL)
                 *
                 * Asynchronously or synchronously loads and processes a JSON schema,
                 * either from a provided object or a URL.
                 *
                 * @param {object} jsonObj - Optional: A direct JSON object to use as schema.
                 * @param {string} jsonURL - Optional: A URL to fetch the JSON schema from.
                 */
                AE_35 = function (jsonObj, jsonURL) {
                    var jsonData = new XMLHttpRequest(),
                        jsonStatus = false,

                        /*
                         * processJSONdata ()
                         *
                         * Processes the parsed JSON data to initialize the database.
                         * This is called after the JSON data has been successfully loaded/parsed.
                         */
                        processJSONdata = function () {
                            if (jsonStatus) {
                                if ('openDatabase' in window) {
                                    jDB = jsonData.database;
                                    jStorage = jsonData.storage;
                                    if (openDB(jDB.shortName, jDB.version, jDB.longName, jDB.maxSize)) {
                                        if (that.settings.reset || that.version === '') {
                                            that.settings.reset = true;
                                            resetOrNewSchema(jDB, jStorage);
                                        } else {
                                            if (jDB.version > that.version && that.version !== '') {
                                                // upgradeSchema(jDB, jStorage); // This functionality is under construction.
                                                that._debug('Schema upgrade detected but functionality is under construction.');
                                            } else {
                                                that.isInitialized = true;
                                                that._debug('Same version and no reset - database merely opened.');
                                                that._debug(that.shortName + ', version ' + that.version + ', is initialized.');
                                            }
                                        }
                                    }
                                } else {
                                    that._errorHandler(null, null, 'Error - Databases are not supported on this platform.');
                                }
                            }
                        },

                        /*
                         * handleJSONresponse ()
                         *
                         * Handles the XMLHttpRequest response, parsing the JSON data.
                         */
                        handleJSONresponse = function () {
                            if (!jsonData || jsonData === null || jsonData.status !== 200) {
                                that._errorHandler(null, null, 'JSON Error ' + jsonData.status + ' - file "' + jsonURL + '" ' + jsonData.statusText + '.');
                            } else {
                                that._debug('JSON file "' + jsonURL + '" loaded.');
                                try {
                                    jsonData = JSON.parse(jsonData.responseText);
                                    jsonStatus = true;
                                } catch (err) {
                                    that._errorHandler(null, null, err);
                                    jsonStatus = false;
                                }
                            }
                        };

                    // Determine whether to load from URL or use provided object
                    if (typeof (jsonURL) !== 'undefined' && jsonURL !== null) {
                        jsonData.open("GET", jsonURL, that.settings.jsonAsynchronous);
                        try {
                            jsonData.send(null);
                        } catch (err) {
                            that._errorHandler(null, null, err);
                            jsonData = null;
                        }
                        if (that.settings.jsonAsynchronous) {
                            jsonData.onreadystatechange = function () {
                                if (jsonData.readyState === 4) {
                                    handleJSONresponse();
                                    processJSONdata();
                                }
                            };
                        } else {
                            handleJSONresponse();
                            processJSONdata();
                        }
                    } else {
                        jsonData = jsonObj;
                        jsonStatus = true;
                        processJSONdata();
                    }
                };

            // Check if a schema source (file or object) is provided
            if ((typeof (that.settings.schemaFile) !== 'undefined' && that.settings.schemaFile !== null) ||
                (typeof (that.settings.schemaObject) !== 'undefined' && that.settings.schemaObject !== null)) {
                AE_35(that.settings.schemaObject, that.settings.schemaFile);
            } else {
                that._errorHandler(null, null, 'Error - schemaFile or schemaObject is not defined for initialization.');
            }
        }, // End of initialization method


        /*
         * outputSchema ()
         *
         * Dumps the current state of localStorage, sessionStorage, and the
         * database schema and data into a JSON object.
         * This functionality is inspired by "Abusing HTML 5 Structured Client-side Storage"
         * by Alberto Trivero (http://trivero.secdiscover.com/html5whitepaper.pdf).
         */
        outputSchema: function () {
            var indices = [],
                json = {},
                ls,
                ss,
                tables = [],
                that = this, // Reference to the DBi instance
                triggers = [],
                views = [],

                /*
                 * getStorage (s)
                 *
                 * Retrieves key-value pairs from a given storage object (localStorage or sessionStorage)
                 * that are prefixed with the database's short name.
                 *
                 * @param {Storage} s - The storage object (localStorage or sessionStorage).
                 * @returns {object} An object containing the relevant storage items.
                 */
                getStorage = function (s) {
                    var dbSN = that.shortName.length !== 0 ? that.shortName.toLowerCase() + '_' : '',
                        i,
                        storage = { isEmpty: true };
                    for (i in s) {
                        if (s.hasOwnProperty(i)) {
                            if (i.substr(0, dbSN.length).toLowerCase() === dbSN) {
                                storage[i.substr(dbSN.length, i.length)] = s.getItem(i);
                                storage.isEmpty = false;
                            }
                        }
                    }
                    return storage;
                },

                /*
                 * outputJSON_Schema (json)
                 *
                 * Sets the generated JSON schema to the instance's schema property
                 * and marks schemaReady as true.
                 *
                 * @param {object} json - The generated JSON schema object.
                 */
                outputJSON_Schema = function (json) {
                    that.schema = json;
                    that.schemaReady = true;
                };

            that.schemaReady = false; // Mark schema as not ready until generation is complete
            json.generationTimeStamp = new Date();
            json.userAgent = navigator.userAgent;

            // Get data from sessionStorage and localStorage
            ls = getStorage(localStorage);
            ss = getStorage(sessionStorage);
            if (ls.isEmpty === false || ss.isEmpty === false) {
                json.storage = {};
                if (ls.isEmpty === false) {
                    delete ls.isEmpty;
                    json.storage.local = ls;
                }
                if (ss.isEmpty === false) {
                    delete ss.isEmpty;
                    json.storage.session = ss;
                }
            }

            // Start pulling the database schema and data if the database is open
            if ('openDatabase' in window) {
                if (that.maxSize !== 0 && that.db.version !== '') {
                    json.database = {
                        shortName: that.shortName,
                        version: that.version,
                        longName: that.longName,
                        maxSize: that.maxSize
                    };
                    that.db.transaction(
                        function (t) {
                            t.executeSql(
                                'SELECT sql FROM sqlite_master WHERE name!="__WebKitDatabaseInfoTable__" AND name NOT LIKE "sqlite_%" ORDER BY 1 DESC;',
                                [],
                                function (t, r) {
                                    var i, sql, table = {},
                                        /*
                                         * dumpTable (t, table)
                                         *
                                         * Retrieves all records from a specified table.
                                         *
                                         * @param {SQLTransaction} t - The current database transaction.
                                         * @param {object} table - The table object to populate with records.
                                         */
                                        dumpTable = function (t, table) {
                                            // Get all data from the selected table
                                            t.executeSql(
                                                'SELECT * FROM ' + table.name + ' ORDER BY 1 DESC;',
                                                [],
                                                function (t, r) {
                                                    var a, b, record = [],
                                                        records = [];
                                                    if (r.rows.length !== 0) {
                                                        for (a = r.rows.length - 1; a >= 0; --a) {
                                                            record = {};
                                                            for (b in r.rows.item(a)) {
                                                                if (r.rows.item(a).hasOwnProperty(b)) {
                                                                    record[b] = r.rows.item(a)[b];
                                                                }
                                                            }
                                                            records.push(record);
                                                        }
                                                        table.records = records;
                                                    }
                                                },
                                                that._errorHandler
                                            );
                                        },

                                        /*
                                         * getColumns (sql)
                                         *
                                         * Extracts column definitions from a SQL CREATE TABLE statement.
                                         * (Note: This function appears to be incomplete or misused in the original logic,
                                         * as 'sql' is expected to be an array of column definitions, not a single string.)
                                         *
                                         * @param {string[]} sql - An array of column definition strings.
                                         * @returns {object} An object mapping column names to their types/constraints.
                                         */
                                        getColumns = function (sql) {
                                            // Extract columns from the SQL
                                            var columns = {},
                                                i, temp = [];
                                            for (i in sql) {
                                                if (sql.hasOwnProperty(i)) {
                                                    temp = sql[i].match(/(\w+)\s+(.+)/);
                                                    columns[temp[1]] = temp[2];
                                                }
                                            }
                                            return columns;
                                        };

                                    for (i = r.rows.length - 1; i >= 0; --i) {
                                        sql = r.rows.item(i).sql.replace(/\s{2,}/g, ' ') + ';';
                                        sql = sql.match(regexParseSQL);
                                        sql[0] = r.rows.item(i).sql.replace(/\s{2,}/g, ' ') + ';';
                                        if (typeof (sql[4]) !== 'undefined') {
                                            /*
                                             * The original code snippet ends abruptly here.
                                             * Assuming the intention was to process the extracted SQL parts
                                             * to build the schema objects (tables, indices, etc.).
                                             * This part would typically involve further parsing of 'sql[4]' for columns
                                             * and 'sql[2]' for object type.
                                             * Since the goal is a Type I clone, we reproduce the code as is.
                                             */
                                        }
                                    }
                                }, // End of executeSql success callback
                                that._errorHandler
                            );
                        } // End of transaction function
                        /*
                         * The original code snippet also ends abruptly here, missing
                         * the error and success callbacks for the transaction itself.
                         * This might indicate an incomplete implementation in the source.
                         * For a Type I clone, we simply end the transaction call here
                         * as per the provided code.
                         */
                    );
                }
            } // End of if ('openDatabase' in window)
        } // End of outputSchema method

    }; // End of DBi.prototype

})(); // End of IIFE