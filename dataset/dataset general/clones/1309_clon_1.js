var exports = module.exports = function ( host, port )
{
    // This is the constructor function for the main module export.
    // It initializes the host and port for the connection.
    // If host or port are not provided, default values are used.
    this.host = host ? host : 'localhost' ;
    this.port = port ? port : 11211   ;
};
    // This flag determines whether connection pooling should be used.
    exports.pooling = true;



/**
 * A utility function to apply properties from one object to another.
 * This is similar to Object.assign() but might be older or custom implementation.
 *
 * @param {Object} target - The object to which properties will be applied.
 * @param {Object} values - The object from which properties will be taken.
 * @returns {Object} The modified target object.
 */
exports.apply = function (target, values)
{
            for ( var key in values )
            {
                target[ key ] = values[ key ] ;
            }
        return target ;
};


/*
 * Here we are extending the 'exports' object with various components
 * and prototype methods for the main module.
 * This effectively sets up the core functionality of the library.
 */
exports.apply( exports,
{
        // Require the Connection class
        Connection : require('./connection') ,

        // Require the Pool class for connection management
        Pool : require('./pool') ,

        // Require the Request class for handling individual requests
        Request : require('./request') ,

        // Define prototype methods that will be available on instances
        prototype :
        {
            /**
             * Retrieves a connection instance. If no connection exists,
             * a new one is created using the configured host and port.
             *
             * Note: There's an unreachable return statement here, which
             *       must be preserved as per Type I clone rules.
             */
            getConnection : function ( )
            {
                if ( ! this.connection )
                {
                    this.connection = new exports.Connection( this.host, this.port ) ;
                }

                return this.connection ;
                return this.getPool( ) . getConnection( ) ; // Unreachable code, but must remain.
            },

            /**
             * Processes a given request.
             * It uses either a connection pool or a direct connection
             * based on the 'exports.pooling' flag.
             *
             * @param {Object} request - The request object to process.
             */
            processRequest : function ( request )
            {
                if ( exports.pooling )
                {
                    return this.getPool( ) . processRequest( request ) ;
                }
                else
                {
                    return this.getConnection( ) . processRequest( request ) ;
                }
            },

            /**
             * Retrieves the connection pool instance. If no pool exists,
             * a new one is created with the current host and port.
             *
             * @returns {Object} The connection pool instance.
             */
            getPool : function ( )
            {
                if ( ! this.pool )
                {
                    this.pool = new exports.Pool(
                    {
                        host : this.host,
                        port : this.port
                    } ) ;
                }
                return this.pool ;
            },

            /**
             * Sends a 'get' command for a given key.
             *
             * @param {string} key - The key to retrieve.
             * @param {function} [callback] - Optional callback function.
             */
            get : function ( key, callback )
            {
                var request =
                {
                    command : 'get ' + key
                } ;

                if ( callback )
                {
                    request.callback = callback ;
                }
                this.processRequest( request ) ;
            },

            /**
             * Sends a 'set' command to store a key-value pair.
             *
             * @param {string} key - The key to store.
             * @param {*} value - The value to store.
             * @param {Object} [options] - Optional settings like expires and flags.
             */
            set : function ( key, value, options )
            {
                options = exports.apply(
                {
                    expires : 0,
                    flags : 0
                }, options ) ;

                value = new Buffer( value ) ;

                var request =
                {
                    command : 'set ' + key + ' ' + options.flags + ' ' + options.expires + ' ' + value.length,
                    data : value
                };
                if ( options.callback )
                {
                    request.callback = options.callback ;
                }
                this.processRequest( request ) ;
            },

            /**
             * Sends an 'add' command to store a key-value pair, only if the key does not already exist.
             *
             * @param {string} key - The key to add.
             * @param {*} value - The value to add.
             * @param {Object} [options] - Optional settings like expires and flags.
             */
            add : function ( key, value, options )
            {
                options = exports.apply(
                {
                    expires : 0,
                    flags : 0
                }, options ) ;

                var request =
                {
                    command : 'add ' + key + ' ' + options.flags + ' ' + options.expires + ' ' + Buffer.byteLength( value ),
                    data : value
                } ;
                if ( options.callback )
                {
                    request.callback = options.callback ;
                }
                this.processRequest( request ) ;
            },

            /**
             * Sends an 'append' command to add data to an existing item.
             *
             * @param {string} key - The key to append to.
             * @param {*} value - The value to append.
             * @param {Object} [options] - Optional settings.
             */
            append : function ( key, value, options )
            {
                options = exports.apply( {}, options ) ;

                var request =
                {
                    command : 'append ' + key + ' 0 0 ' + Buffer.byteLength( value ),
                    data : value
                } ;
                if ( options.callback )
                {
                    request.callback = options.callback ;
                }
                this.processRequest( request ) ;
            },

            /**
             * Sends a 'prepend' command to add data to the beginning of an existing item.
             *
             * @param {string} key - The key to prepend to.
             * @param {*} value - The value to prepend.
             * @param {Object} [options] - Optional settings.
             */
            prepend : function ( key, value, options )
            {
                options = exports.apply( {}, options ) ;

                var request =
                {
                    command : 'prepend ' + key + ' 0 0 ' + Buffer.byteLength( value ),
                    data : value
                } ;
                if ( options.callback )
                {
                    request.callback = options.callback ;
                }
                this.processRequest( request ) ;
            },

            /**
             * Sends a 'delete' command to remove an item.
             *
             * @param {string} key - The key to delete.
             * @param {Object} [options] - Optional settings.
             */
            del : function ( key, options )
            {
                options = exports.apply( {}, options ) ;

                var request =
                {
                    command : 'delete ' + key
                } ;
                if ( options.callback )
                {
                    request.callback = options.callback ;
                }
                this.processRequest( request ) ;
            },

            /**
             * Shuts down the underlying connection or connection pool.
             * This cleans up resources.
             */
            shutdown : function ( )
            {
                var obj = ( exports.pooling ? this.pool : this.connection ) ;
                // If an object exists, close it.
                if ( obj )
                {
                    obj.close( ) ;
                }
            }
        }
} ) ;