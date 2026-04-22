try {
    if ( ! window ) {
        window = {};
        // This line was commented out in the original source,
        // so it remains commented here.
        /* exports.console = console; */
    }
}
catch ( e ) {
    // In case window is not defined, initialize it and expose console.
    window = {};
    exports.console = console;
}

// Global persistence object initialization.
var persistence = ( window && window.persistence ) ? window.persistence : { };

// Ensure persistence.store exists.
if ( ! persistence.store ) {
    persistence.store = {};
}

// Initialize persistence.store.sql specific namespace.
persistence.store.sql = {};


/**
 * Configuration module for SQL persistence store.
 * @param {object} persistence - The main persistence object.
 * @param {object} dialect - The SQL dialect object.
 */
persistence.store.sql.config = function ( persistence, dialect ) {
    const argspec = persistence.argspec; // Use const for argspec.

    /**
     * Default type mapper for SQL databases.
     * This object defines how JavaScript types map to SQL types
     * and handles value conversions between entity and database representations.
     * Developers can override properties or methods to customize type handling.
     */
    persistence.typeMapper = {
        /**
         * The SQL type definition used for primary keys (IDs).
         * Typically a string type with a fixed length.
         */
        idType: "VARCHAR(32)",

        /**
         * The SQL type definition for class names, primarily used by mixins
         * to store the actual type of a mixed-in entity.
         */
        classNameType: "TEXT",

        /**
         * Determines the appropriate SQL column type for a given persistence
         * type identifier. This method supports custom mappings for common
         * types like JSON, BOOL, and DATE.
         * @param {string} type - The persistence type (e.g., 'JSON', 'BOOL', 'DATE', or a standard SQL type).
         * @returns {string} The corresponding SQL column type.
         */
        columnType: function ( type ) {
            switch ( type ) {
                case 'JSON':
                    return 'TEXT';
                case 'BOOL':
                    return 'INT'; // Booleans often stored as integers (0 or 1).
                case 'DATE':
                    return 'INT'; // Dates often stored as Unix timestamps (integers).
                default:
                    return type; // For other types, use the type name directly.
            }
        },

        /**
         * Pre-processes an input variable string for use in a SQL query.
         * Can be used for type-specific formatting or escaping.
         * @param {string} str - The input variable string (e.g., '?').
         * @param {string} type - The persistence type of the variable.
         * @returns {string} The processed string.
         */
        inVar: function ( str, type ) {
            return str;
        },

        /**
         * Post-processes an output variable string from a SQL query.
         * Can be used for type-specific formatting or casting.
         * @param {string} str - The output variable string (e.g., '?').
         * @param {string} type - The persistence type of the variable.
         * @returns {string} The processed string.
         */
        outVar: function ( str, type ) {
            return str;
        },

        /**
         * Formats an ID value for direct inclusion in a SQL query.
         * Typically wraps the ID in single quotes for string representation.
         * @param {string} str - The ID value.
         * @returns {string} The formatted ID string.
         */
        outId: function ( str ) {
            return "'" + str + "'";
        },

        /**
         * Converts a value retrieved from the database into a format suitable
         * for an entity property in JavaScript. This includes parsing numbers,
         * dates, and JSON strings.
         * @param {*} val - The raw value from the database.
         * @param {string} type - The persistence type of the property.
         * @returns {*} The converted value for the entity.
         */
        dbValToEntityVal: function ( val, type ) {
            // Handle null or undefined values directly.
            if ( val === null || val === undefined ) {
                return val;
            }

            switch ( type ) {
                case 'DATE':
                    // SQL timestamps are often in seconds, JavaScript Dates use milliseconds.
                    return new Date( parseInt( val, 10 ) * 1000 );
                case 'BOOL':
                    // Convert integer/string '1' to true, anything else to false.
                    return val === 1 || val === '1';
                    break; // Keep original break statements.
                case 'INT':
                    // Convert to number using unary plus.
                    return +val;
                    break;
                case 'BIGINT':
                    // Convert to number using unary plus.
                    return +val;
                    break;
                case 'JSON':
                    // Parse JSON string if present, otherwise return original value.
                    if ( val ) {
                        return JSON.parse( val );
                    } else {
                        return val;
                    }
                    break;
                default:
                    return val; // Return value as-is for other types.
            }
        },

        /**
         * Converts an entity property value from JavaScript into a format
         * suitable for storage in the database. This is the inverse operation
         * of `dbValToEntityVal`.
         * @param {*} val - The entity property value.
         * @param {string} type - The persistence type of the property.
         * @returns {*} The converted value for the database.
         */
        entityValToDbVal: function ( val, type ) {
            // Handle undefined or null values by returning null.
            if ( val === undefined || val === null ) {
                return null;
            }
            // For JSON types, stringify the object.
            else if ( type === 'JSON' && val ) {
                return JSON.stringify( val );
            }
            // If the value has an 'id' property, return the ID (e.g., for related entities).
            else if ( val.id ) {
                return val.id;
            }
            // For boolean types, convert to 0 or 1.
            else if ( type === 'BOOL' ) {
                return ( val === 'false' ) ? 0 : ( val ? 1 : 0 );
            }
            // For DATE types or objects with a getTime method (Date objects),
            // convert to Unix timestamp in seconds.
            else if ( type === 'DATE' || val.getTime ) {
                val = new Date( val ); // Ensure it's a Date object.
                return Math.round( val.getTime() / 1000 );
            }
            // For all other types, return the value as-is.
            else {
                return val;
            }
        },

        /**
         * Shortcut for `inVar` specifically for ID types.
         * @param {string} str - The input variable string.
         * @returns {string} The processed string for an ID variable.
         */
        inIdVar: function ( str ) {
            return this.inVar( str, this.idType );
        },

        /**
         * Shortcut for `outVar` specifically for ID types.
         * @param {string} str - The output variable string.
         * @returns {string} The processed string for an ID variable.
         */
        outIdVar: function ( str ) {
            return this.outVar( str, this.idType );
        },

        /**
         * Shortcut for `entityValToDbVal` specifically for ID types.
         * @param {*} id - The ID value from an entity.
         * @returns {*} The converted ID value for the database.
         */
        entityIdToDbId: function ( id ) {
            return this.entityValToDbVal( id, this.idType );
        }
    }; // End of persistence.typeMapper object.


    // Initialize a set to keep track of tables already generated.
    persistence.generatedTables = {};


    /**
     * Synchronizes the defined data model with the underlying database schema.
     * This function creates tables and indexes that do not yet exist,
     * based on the entity definitions.
     *
     * @param {object} tx - The active database transaction object (optional).
     * @param {function} callback - Function to be invoked upon completion,
     *                              receives the transaction object.
     * @param {boolean} emulate - If true, only emulates the sync without
     *                            actual database modifications.
     */
    persistence.schemaSync = function ( tx, callback, emulate ) {
        // Parse arguments using argspec to handle optional parameters and defaults.
        const args = argspec.getArgs( arguments, [
            { name: "tx", optional: true, check: persistence.isTransaction, defaultValue: null },
            { name: "callback", optional: true, check: argspec.isCallback(), defaultValue: function ( ) { } },
            { name: "emulate", optional: true, check: argspec.hasType( 'boolean' ) }
        ] );
        tx       = args.tx;
        callback = args.callback;
        emulate  = args.emulate;

        // If no transaction is provided, start a new one and re-call schemaSync.
        if ( ! tx ) {
            const session = this;
            this.transaction( function ( tx ) { session.schemaSync( tx, callback, emulate ); } );
            return;
        }

        // Variables for query generation.
        const queries = [ ];
        let meta, colDefs, otherMeta, tableName;

        const tm         = persistence.typeMapper;
        const entityMeta = persistence.getEntityMeta();

        // Iterate over all defined entities to generate schema.
        for ( const entityName in entityMeta ) {
            if ( entityMeta.hasOwnProperty( entityName ) ) {
                meta = entityMeta[ entityName ];

                if ( ! meta.isMixin ) { // Process non-mixin entities first.
                    colDefs = [ ];
                    // Add field definitions.
                    for ( const prop in meta.fields ) {
                        if ( meta.fields.hasOwnProperty( prop ) ) {
                            colDefs.push( [ prop, meta.fields[ prop ] ] );
                        }
                    }
                    // Add hasOne relationship columns and indexes.
                    for ( const rel in meta.hasOne ) {
                        if ( meta.hasOne.hasOwnProperty( rel ) ) {
                            otherMeta = meta.hasOne[ rel ].type.meta;
                            colDefs.push( [ rel, tm.idType ] );
                            queries.push( [ dialect.createIndex( meta.name, [ rel ] ), null ] );
                        }
                    }
                    // Add custom indexes.
                    for ( let i = 0; i < meta.indexes.length; i++ ) {
                        queries.push( [ dialect.createIndex( meta.name, meta.indexes[ i ].columns, meta.indexes[ i ] ), null ] );
                    }
                }

                // Process hasMany relationships for many-to-many tables.
                for ( const rel in meta.hasMany ) {
                    if ( meta.hasMany.hasOwnProperty( rel ) && meta.hasMany[ rel ].manyToMany ) {
                        tableName = meta.hasMany[ rel ].tableName;

                        // Only create table if not already generated.
                        if ( ! persistence.generatedTables[ tableName ] ) {
                            const otherMeta = meta.hasMany[ rel ].type.meta;
                            const inv       = meta.hasMany[ rel ].inverseProperty;

                            // This check ensures mixin MTM tables are created correctly,
                            // preventing redundant creations or incorrect relations.
                            if ( otherMeta.hasMany[ inv ].type.meta !== meta ) {
                                continue;
                            }

                            const p1 = meta.name + "_" + rel;
                            const p2 = otherMeta.name + "_" + inv;

                            queries.push( [ dialect.createIndex( tableName, [ p1 ] ), null ] );
                            queries.push( [ dialect.createIndex( tableName, [ p2 ] ), null ] );

                            const columns = [ [ p1, tm.idType ], [ p2, tm.idType ] ];
                            if ( meta.isMixin ) {
                                columns.push( [ p1 + "_class", tm.classNameType ] );
                            }
                            if ( otherMeta.isMixin ) {
                                columns.push( [ p2 + "_class", tm.classNameType ] );
                            }

                            queries.push( [ dialect.createTable( tableName, columns ), null ] );
                            persistence.generatedTables[ tableName ] = true;
                        }
                    }
                }

                // Finalize table creation for non-mixin entities.
                if ( ! meta.isMixin ) {
                    colDefs.push( [ "id", tm.idType, "PRIMARY KEY" ] );
                    persistence.generatedTables[ meta.name ] = true;
                    queries.push( [ dialect.createTable( meta.name, colDefs ), null ] );
                }
            }
        }

        // Execute schema sync hooks.
        const fns = persistence.schemaSyncHooks;
        for ( let i = 0; i < fns.length; i++ ) {
            fns[ i ]( tx );
        }

        // Handle emulation mode or actual query execution.
        if ( emulate ) {
            callback( tx ); // If emulating, just call back.
        } else {
            // Execute all generated queries sequentially.
            executeQueriesSeq( tx, queries, function ( ) {
                callback( tx );
            } );
        }
    }; // End of persistence.schemaSync.


    /**
     * Persists all pending changes (new, modified, removed objects)
     * to the database within the current transaction.
     *
     * @param {object} tx - The database transaction object.
     * @param {function} callback - Function to call once flushing is complete.
     */
    persistence.flush = function ( tx, callback ) {
        const args = argspec.getArgs( arguments, [
            { name: "tx", optional: true, check: persistence.isTransaction },
            { name: "callback", optional: true, check: argspec.isCallback(), defaultValue: null }
        ] );
        tx       = args.tx;
        callback = args.callback;

        const session = this;
        // If no transaction is passed, initiate one.
        if ( ! tx ) {
            this.transaction( function ( tx ) { session.flush( tx, callback ); } );
            return;
        }

        // Execute flush hooks.
        const fns = persistence.flushHooks;
        for ( let i = 0; i < fns.length; i++ ) {
            fns[ i ]( session, tx );
        }

        const persistObjArray = [ ];
        // Collect all tracked objects that need to be persisted.
        for ( const id in session.trackedObjects ) {
            if ( session.trackedObjects.hasOwnProperty( id ) ) {
                persistObjArray.push( session.trackedObjects[ id ] );
            }
        }

        const removeObjArray = [ ];
        // Collect objects marked for removal.
        for ( const id in session.objectsToRemove ) {
            if ( session.objectsToRemove.hasOwnProperty( id ) ) {
                removeObjArray.push( session.objectsToRemove[ id ] );
                delete session.trackedObjects[ id ]; // Stop tracking removed objects.
            }
        }
        session.objectsToRemove = {}; // Clear the removal queue.

        // If a callback is provided, use asynchronous parallel processing.
        if ( callback ) {
            persistence.asyncParForEach( removeObjArray, function ( obj, callback ) {
                remove( obj, tx, callback );
            }, function ( ) {
                persistence.asyncParForEach( persistObjArray, function ( obj, callback ) {
                    save( obj, tx, callback );
                }, callback );
            } );
        } else {
            // If no callback, perform synchronous operations (less efficient for many objects).
            for ( let i = 0; i < persistObjArray.length; i++ ) {
                save( persistObjArray[ i ], tx );
            }
            for ( let i = 0; i < removeObjArray.length; i++ ) {
                remove( removeObjArray[ i ], tx );
            }
        }
    }; // End of persistence.flush.


    /**
     * Resets the database by dropping all tables defined in the model.
     * This function effectively clears all data and schema.
     *
     * @param {object} tx - The database transaction object (optional).
     * @param {function} callback - Function to be called after reset is complete.
     */
    persistence.reset = function ( tx, callback ) {
        const args = argspec.getArgs( arguments, [
            { name: "tx", optional: true, check: persistence.isTransaction, defaultValue: null },
            { name: "callback", optional: true, check: argspec.isCallback(), defaultValue: function ( ) { } }
        ] );
        tx       = args.tx;
        callback = args.callback;

        const session = this;
        // If no transaction, start one and re-call reset.
        if ( ! tx ) {
            session.transaction( function ( tx ) { session.reset( tx, callback ); } );
            return;
        }

        // First, emulate schema synchronization to determine all generated tables.
        this.schemaSync( tx, function ( ) {
            const tableArray = [ ];
            // Populate tableArray with names of all generated tables.
            for ( const p in persistence.generatedTables ) {
                if ( persistence.generatedTables.hasOwnProperty( p ) ) {
                    tableArray.push( p );
                }
            }

            /**
             * Recursively drops one table at a time until all are removed.
             */
            function dropOneTable ( ) {
                const tableName = tableArray.pop();
                tx.executeSql( "DROP TABLE IF EXISTS `" + tableName + "`", null, function ( ) {
                    if ( tableArray.length > 0 ) {
                        dropOneTable(); // Drop next table.
                    } else {
                        cb(); // All tables dropped, call final callback.
                    }
                } );
            }

            if ( tableArray.length > 0 ) {
                dropOneTable();
            } else {
                cb(); // No tables to drop, proceed to final callback.
            }

            /**
             * Final callback function for the reset operation.
             * Cleans up session, resets generatedTables, and invokes the user-provided callback.
             */
            function cb ( ) {
                session.clean();
                persistence.generatedTables = {}; // Clear generated tables record.
                if ( callback ) {
                    callback();
                }
            }
        }, true ); // Pass 'true' for emulate mode.
    }; // End of persistence.reset.


    /**
     * Converts a raw database row into an entity object, hydrating its properties.
     * Handles caching of already tracked objects.
     * @param {object} session - The current persistence session.
     * @param {string} entityName - The name of the entity type.
     * @param {object} row - The database row object.
     * @param {string} [prefix=''] - An optional prefix for column names in the row.
     * @returns {object|null} The hydrated entity object, or null if no ID is found.
     */
    function rowToEntity ( session, entityName, row, prefix ) {
        prefix = prefix || '';

        // Check if the object is already in the session cache.
        if ( session.trackedObjects[ row[ prefix + "id" ] ] ) {
            return session.trackedObjects[ row[ prefix + "id" ] ];
        }

        const tm      = persistence.typeMapper;
        const rowMeta = persistence.getMeta( entityName );
        const ent     = persistence.define( entityName ); // Get the entity constructor.

        // If no ID is present, it means no entity was found for this row.
        if ( ! row[ prefix + 'id' ] ) {
            return null;
        }

        const o = new ent(); // Create a new entity instance.
        o.id    = tm.dbValToEntityVal( row[ prefix + 'id' ], tm.idType );
        o._new  = false; // Mark as existing, not new.

        // Populate entity data from the row.
        for ( const p in row ) {
            if ( row.hasOwnProperty( p ) ) {
                if ( p.substring( 0, prefix.length ) === prefix ) {
                    const prop = p.substring( prefix.length );
                    if ( prop !== 'id' ) { // Skip the ID, already handled.
                        o._data[ prop ] = tm.dbValToEntityVal( row[ p ], rowMeta.fields[ prop ] || tm.idType );
                    }
                }
            }
        }
        return o;
    }


    /**
     * Internal function to persist an object's changes to the database.
     * This function is invoked by `persistence.flush()`.
     *
     * @param {object} obj - The entity object to save.
     * @param {object} tx - The database transaction object.
     * @param {function} [callback] - Optional callback function.
     */
    function save ( obj, tx, callback ) {
        const meta = persistence.getMeta( obj._type );
        const tm   = persistence.typeMapper;

        const properties = [ ];
        const values     = [ ];
        const qs         = [ ]; // Question marks for placeholders.
        const propertyPairs = [ ]; // For UPDATE statements.

        // If the object is new, mark all its fields as dirty for insertion.
        if ( obj._new ) {
            for ( const p in meta.fields ) {
                if ( meta.fields.hasOwnProperty( p ) ) {
                    obj._dirtyProperties[ p ] = true;
                }
            }
        }

        // Collect dirty properties for SQL query.
        for ( const p in obj._dirtyProperties ) {
            if ( obj._dirtyProperties.hasOwnProperty( p ) ) {
                properties.push( "`" + p + "`" );
                const type = meta.fields[ p ] || tm.idType;
                values.push( tm.entityValToDbVal( obj._data[ p ], type ) );
                qs.push( tm.outVar( "?", type ) );
                propertyPairs.push( "`" + p + "` = " + tm.outVar( "?", type ) );
            }
        }

        let additionalQueries = [ ];
        // Collect queries for many-to-many relationships.
        for ( const p in meta.hasMany ) {
            if ( meta.hasMany.hasOwnProperty( p ) ) {
                additionalQueries = additionalQueries.concat( persistence.get( obj, p ).persistQueries() );
            }
        }

        // Execute additional queries (e.g., for MTM) then save the main object.
        executeQueriesSeq( tx, additionalQueries, function ( ) {
            // If no properties changed and it's not a new object, nothing to do.
            if ( properties.length === 0 && ! obj._new ) {
                if ( callback ) {
                    callback();
                }
                return;
            }

            obj._dirtyProperties = {}; // Clear dirty flags.

            if ( obj._new ) { // INSERT operation for new objects.
                properties.push( 'id' );
                values.push( tm.entityIdToDbId( obj.id ) );
                qs.push( tm.outIdVar( '?' ) );
                const sql = "INSERT INTO `" + obj._type + "` (" + properties.join( ", " ) + ") VALUES (" + qs.join( ', ' ) + ")";
                obj._new  = false; // Mark object as no longer new.
                tx.executeSql( sql, values, callback );
            } else { // UPDATE operation for existing objects.
                const sql = "UPDATE `" + obj._type + "` SET " + propertyPairs.join( ',' ) + " WHERE id = " + tm.outId( obj.id );
                tx.executeSql( sql, values, callback );
            }
        } );
    }


    /**
     * Internal function to remove an object from the database.
     * This function is invoked by `persistence.flush()`.
     *
     * @param {object} obj - The entity object to remove.
     * @param {object} tx - The database transaction object.
     * @param {function} [callback] - Optional callback function.
     */
    function remove ( obj, tx, callback ) {
        const meta = persistence.getMeta( obj._type );
        const tm   = persistence.typeMapper;

        const queries = [ [ "DELETE FROM `" + obj._type + "` WHERE id = " + tm.outId( obj.id ), null ] ];

        // Also delete associated many-to-many relationship entries.
        for ( const rel in meta.hasMany ) {
            if ( meta.hasMany.hasOwnProperty( rel ) && meta.hasMany[ rel ].manyToMany ) {
                const tableName = meta.hasMany[ rel ].tableName;
                // No need for inverseProperty here for deletion.
                queries.push( [ "DELETE FROM `" + tableName + "` WHERE `" + meta.name + '_' + rel + "` = " + tm.outId( obj.id ), null ] );
            }
        }
        executeQueriesSeq( tx, queries, callback );
    }


    /**
     * Utility function to execute a series of SQL queries sequentially
     * within a transaction in an asynchronous manner.
     *
     * @param {object} tx - The transaction object to execute queries on.
     * @param {Array<Array>} queries - An array of `[query_string, args_array]` tuples.
     * @param {function} callback - The function to call once all queries have completed.
     * @param {...*} [callbackArgs] - Additional arguments to pass to the final callback.
     */
    function executeQueriesSeq ( tx, queries, callback ) {
        // The original code included `queries.reverse();` which was commented out.
        // It remains commented here, maintaining the original structure.
        // queries.reverse();

        const callbackArgs = [ ];
        // Collect any additional arguments meant for the final callback.
        for ( let i = 3; i < arguments.length; i++ ) {
            callbackArgs.push( arguments[ i ] );
        }

        // Use persistence.asyncForEach to execute queries one by one.
        persistence.asyncForEach( queries, function ( queryTuple, nextQueryCallback ) {
            tx.executeSql( queryTuple[ 0 ], queryTuple[ 1 ], nextQueryCallback, function ( _, err ) {
                // Log errors but continue execution.
                console.log( err.message );
                nextQueryCallback();
            } );
        }, function ( ) {
            // After all queries are done, invoke the main callback.
            if ( callback ) {
                callback.apply( null, callbackArgs );
            }
        } );
    }

    // Expose the internal executeQueriesSeq utility.
    persistence.executeQueriesSeq = executeQueriesSeq;


    ////////////////////////////////////////////////////////////////////////////
    // QueryCollection patches to integrate with the SQL environment          //
    // These modifications extend the QueryCollection prototype to support    //
    // SQL-specific behaviors like additional joins, where clauses, etc.      //
    ////////////////////////////////////////////////////////////////////////////


    /**
     * Defines the `persistQueries` method for QueryCollection.
     * When a session is flushed, this method returns a list of SQL queries
     * (as `[query, arg]` tuples) that need to be executed for the collection.
     * By default, it returns an empty array, as collections themselves don't
     * directly persist their state, but rather their contained entities.
     * @returns {Array<Array>} An array of SQL query tuples.
     */
    persistence.QueryCollection.prototype.persistQueries = function ( ) {
        return [ ];
    };


    // Store the original `clone` method to extend its functionality.
    const oldQCClone = persistence.QueryCollection.prototype.clone;

    /**
     * Overrides the `clone` method of QueryCollection to ensure
     * SQL-specific properties like additional join, where, and group clauses
     * are also copied to the new cloned instance.
     * @param {boolean} cloneSubscribers - Whether to clone event subscribers.
     * @returns {object} The cloned QueryCollection instance.
     */
    persistence.QueryCollection.prototype.clone = function ( cloneSubscribers ) {
        const c = oldQCClone.call( this, cloneSubscribers ); // Call original clone method.
        // Copy SQL-specific internal arrays.
        c._additionalJoinSqls  = this._additionalJoinSqls.slice( 0 );
        c._additionalWhereSqls = this._additionalWhereSqls.slice( 0 );
        c._additionalGroupSqls = this._additionalGroupSqls.slice( 0 );
        c._manyToManyFetch     = this._manyToManyFetch; // Copy many-to-many fetch flag.
        return c;
    };


    // Store the original `init` method to extend its functionality.
    const oldQCInit = persistence.QueryCollection.prototype.init;

    /**
     * Overrides the `init` method of QueryCollection to initialize
     * SQL-specific internal properties for managing query parts.
     * @param {object} session - The persistence session.
     * @param {string} entityName - The name of the entity this collection holds.
     * @param {function} constructor - The constructor function for the entity.
     */
    persistence.QueryCollection.prototype.init = function ( session, entityName, constructor ) {
        oldQCInit.call( this, session, entityName, constructor ); // Call original init method.
        this._manyToManyFetch     = null; // Flag for MTM fetches.
        this._additionalJoinSqls  = [ ];  // Stores custom JOIN clauses.
        this._additionalWhereSqls = [ ];  // Stores custom WHERE clauses.
        this._additionalGroupSqls = [ ];  // Stores custom GROUP BY clauses.
    };


    // Store the original `toUniqueString` method to extend its functionality.
    const oldQCToUniqueString = persistence.QueryCollection.prototype.toUniqueString;

    /**
     * Overrides the `toUniqueString` method to include SQL-specific query parts
     * in the unique string representation. This helps in caching and identifying
     * unique queries based on their full SQL structure.
     * @returns {string} A unique string representation of the query collection.
     */
    persistence.QueryCollection.prototype.toUniqueString = function ( ) {
        let s = oldQCToUniqueString.call( this ); // Start with the base unique string.
        s += '|JoinSQLs:';
        for ( let i = 0; i < this._additionalJoinSqls.length; i++ ) {
            s += this._additionalJoinSqls[ i ];
        }
        s += '|WhereSQLs:';
        // The original code was truncated here, so I'll maintain that.
        // If it were a full method, it would likely continue adding other SQL parts.