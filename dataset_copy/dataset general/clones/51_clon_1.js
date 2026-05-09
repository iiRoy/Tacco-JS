Ext.namespace( "Ext.ux.data" ); // Initialize the namespace for DWR proxy components.

/**
 * @class Ext.ux.data.DwrProxy
 * @extends Ext.data.DataProxy
 * @author loeppky
 * An implementation of Ext.data.DataProxy that leverages DWR for remote data interaction.
 * Please note that not all configuration options from Ext.data.DataProxy are applicable to Ext.ux.data.DwrProxy.
 * The following example demonstrates a comprehensive configuration setup for the constructor:
 * <code><pre>
 *  new Ext.ux.data.DwrProxy( {
 *      // Configuration inherited from Ext.data.DataProxy
 *      apiActionToHandlerMap : {
 *          read : {
 *              dwrFunction : DwrInterface.read,
 *              // Custom function to prepare DWR arguments, including paging parameters.
 *              getDwrArgsFunction : function ( request ) {
 *                  var pagingParamNames = this.store.paramNames;
 *                  var params = request.params;
 *                  return [ params[pagingParamNames.start], params[pagingParamNames.limit] ];
 *              },
 *              // The scope for getDwrArgsFunction is set to 'this' to allow access to store properties.
 *              getDwrArgsScope : this
 *          },
 *          // These handlers are optional if only read operations are performed.
 *          create : {
 *              // Utilizes the default function which formats DWR arguments as an array of objects to create.
 *              dwrFunction : DwrInterface.create
 *          },
 *          update : {
 *              dwrFunction : DwrInterface.update
 *          },
 *          destroy : {
 *              dwrFunction : DwrInterface.destroy,
 *              // A custom function to pass additional parameters like login and password, alongside objects to delete.
 *              getDwrArgsFunction : function ( request, recordDataArray ) {
 *                  return [ recordDataArray, this.login, this.password ];
 *              },
 *              getDwrArgsScope : this
 *          }
 *      }
 *  } );
 * </pre></code>
 * @constructor
 * @param {Object} config The configuration object for the DwrProxy instance.
 */
Ext.ux.data.DwrProxy = function ( config ) {

    // Validate the presence of configuration and the crucial apiActionToHandlerMap.
    if ( !config || !config.apiActionToHandlerMap ) {
        throw new Exception( '"apiActionToHandlerMap" is not defined within config.' );
    }

    // Initialize and populate apiActionToHandlerMap with Ext.ux.data.DwrProxy.ActionHandler instances.
    this.apiActionToHandlerMap = {};
    Ext.iterate( Ext.data.Api.actions, function ( action ) {
        var actionHandlerConfig = config.apiActionToHandlerMap[action];
        if ( actionHandlerConfig ) {
            actionHandlerConfig.action = action; // Assign the action type to the handler config.
            this.apiActionToHandlerMap[action] = new Ext.ux.data.DwrProxy.ActionHandler( actionHandlerConfig );
        }
    }, this );

    /*
     * Ext.data.DataProxy mandates an "api" key for API actions.
     * To prevent an Ext.data.DataProxy.Error, 'api' is aliased to 'apiActionToHandlerMap',
     * as both structures share identical keys (e.g., "create", "read", "update", "destroy").
     */
    config.api = this.apiActionToHandlerMap;

    // Call the constructor of the superclass (Ext.data.DataProxy) to ensure proper initialization.
    Ext.ux.data.DwrProxy.superclass.constructor.call( this, config );
};

Ext.extend( Ext.ux.data.DwrProxy, Ext.data.DataProxy, {

    /**
     * @cfg {Object} apiActionToHandlerMap.
     * A mapping of {@link Ext.data.Api} actions to their corresponding {@link Ext.ux.data.DwrProxy.ActionHandler}s.
     * This option is conceptually similar to {@link Ext.data.DataProxy#api}, but its distinct name and value
     * types are chosen to prevent confusion and enhance clarity.
     */
    apiActionToHandlerMap : {},

    /**
     * DwrProxy's specific implementation of {@link Ext.data.DataProxy#doRequest}.
     * This method strives to emulate the behavior of {@link Ext.data.HttpProxy#doRequest} as closely as possible.
     * It invokes the appropriate getDwrArgsFunction for the given action, then executes the dwrFunction.
     * Refer to {@link Ext.data.DataProxy#request} for detailed parameter descriptions.
     * @private
     * @param {String} action The CRUD action type (e.g., 'create', 'read', 'update', 'destroy').
     * @param {Ext.data.Record[]} records An array of Ext.data.Record instances relevant to the action.
     * @param {Object} params Request parameters to be sent to the remote server.
     * @param {Ext.data.DataReader} reader The data reader responsible for interpreting the server's response.
     * @param {Function} callback The callback function to be executed upon completion of the request.
     * @param {Object} scope The execution scope for the callback function.
     * @param {Object} options Additional options passed to the callback.
     */
    doRequest : function ( action, records, params, reader, callback, scope, options ) {
        var request = new Ext.ux.data.DataProxy.Request( action, records, params, reader, callback, scope, options );
        var apiActionHandler = this.apiActionToHandlerMap[action];

        if ( !apiActionHandler ) {
            throw new Exception( 'No API Action Handler defined for action: ' + action );
        }

        // Generate DWR arguments, including current and pre-update record data.
        var dwrArgs = apiActionHandler.getDwrArgsFunction.call(
            apiActionHandler.getDwrArgsScope, request, this.getRecordDataArray( records ), this.getRecordDataBeforeUpdateArray( records )
        ) || [];
        dwrArgs.push( this.createCallback( request ) ); // Append the DWR callback function.
        apiActionHandler.dwrFunction.apply( Object, dwrArgs ); // Execute the DWR function. The scope (Object) is arbitrary here.
    },

    /**
     * Extracts raw data objects from an array of Ext.data.Record instances.
     * @param {Ext.data.Record[]} records The array of {@link Ext.data.Record}s from which to extract data.
     * @return {Object[]} An array containing the `data` property of each {@link Ext.data.Record}.
     * This prevents sending full {@link Ext.data.Record} objects to DWR, which may contain
     * properties not expected by DWR DTOs.
     */
    getRecordDataArray : function ( records ) {
        return Ext.pluck( records, 'data' ) || [];
    },

    /**
     * Retrieves the original data state of updated records before any modifications were applied.
     * @param {Ext.data.Record[]} records The array of {@link Ext.data.Record}s that have been updated.
     * @return {Object[]} An array of data objects representing the state of each record prior to update.
     * This ensures that DWR receives only the relevant data, not the complete {@link Ext.data.Record} objects.
     */
    getRecordDataBeforeUpdateArray : function ( records ) {
        var recordDataBeforeUpdate = [];
        Ext.each( records, function ( record ) {
            // Construct the record data as it existed before the update, merging modified and current data.
            recordDataBeforeUpdate.push( Ext.apply( {}, record.modified, record.data ) );
        } );
        return recordDataBeforeUpdate;
    },

    /**
     * A helper method for `doRequest` that constructs a DWR-compatible callback object.
     * This callback object includes both a success handler and an exception handler,
     * mirroring `HttpProxy#createCallback` while adapting to DWR's dual-callback mechanism.
     * @param {Ext.ux.data.DataProxy.Request} request The {@link Ext.ux.data.DataProxy.Request} object passed to {@link #doRequest}.
     * @private
     * @return {Object} An object containing `callback` and `exceptionHandler` functions for DWR.
     */
    createCallback : function ( request ) {
        return {
            callback: function ( response ) {
                if ( request.action === Ext.data.Api.actions.read ) {
                    this.onRead( request, response );
                } else {
                    this.onWrite( request, response );
                }
            }.createDelegate( this ), // Ensure the callback executes within the DwrProxy's scope.
            exceptionHandler : function ( message, exception ) {
                // DWR doesn't provide a response object for exceptions, so the message is used instead.
                this.handleResponseException( request, message, exception );
            }.createDelegate( this ) // Ensure the exception handler executes within the DwrProxy's scope.
        };
    },

    /**
     * A helper method for `createCallback` dedicated to handling 'read' actions.
     * After processing the DWR response and creating records, it invokes the callback function
     * specified in the `Ext.ux.data.DataProxy.Request`. This mirrors `HttpProxy#onRead`.
     * @param {Ext.ux.data.DataProxy.Request} request The arguments originally passed to {@link #doRequest}.
     * @param {Object} response The response object received from the DWR call, expected to be convertible to {@link Ext.data.Records}.
     * @private
     */
    onRead : function ( request, response ) {
        var readDataBlock;
        try {
            // Call readRecords() instead of read() because DWR already provides an Object,
            // bypassing the need for JSON decoding.
            readDataBlock = request.reader.readRecords( response );
        } catch ( e ) {
            return this.handleResponseException( request, response, e );
        }

        if ( readDataBlock.success === false ) {
            this.fireEvent( "exception", this, 'remote', request.action, request.options, response, null );
        } else {
            this.fireEvent( "load", this, request, request.options );
        }
        request.callback.call( request.scope, readDataBlock, request.options, readDataBlock.success );
    },

    /**
     * A helper method for `createCallback` responsible for handling 'create', 'update', and 'destroy' actions.
     * This method closely mirrors `HttpProxy#onWrite`.
     * @param {Ext.ux.data.DataProxy.Request} request The arguments originally passed to {@link #doRequest}.
     * @param {Object} response The response object from the DWR call, expected to be convertible to {@link Ext.data.Records}.
     * @private
     */
    onWrite : function ( request, response ) {
        var readDataBlock;
        try {
            readDataBlock = request.reader.readResponse( request.action, response );
        } catch ( e ) {
            return this.handleResponseException( request, response, e );
        }

        if ( readDataBlock.success === false ) {
            this.fireEvent( "exception", this, 'remote', request.action, request.options, response, request.records );
        } else {
            this.fireEvent( "write", this, request.action, readDataBlock.data, readDataBlock, request.records, request.options );
        }
        request.callback.call( request.scope, readDataBlock.data, readDataBlock, readDataBlock.success );
    },

    /**
     * Handles exceptions that occur during the processing of a DWR response.
     * This method fires an 'exception' event and invokes the request's callback with a failure status.
     * @param {Ext.ux.data.DataProxy.Request} request The original request object.
     * @param {Object} response The DWR response (or message if no response object is available).
     * @param {Object} exception The exception object that was thrown.
     */
    handleResponseException : function ( request, response, exception ) {
        this.fireEvent( "exception", this, 'response', request.action, request.options, response, exception );
        request.callback.call( request.scope, null, request.options, false );
    }
} );

/**
 * @class Ext.ux.data.DwrProxy.ActionHandler
 * This class encapsulates the specific parameters and functions required for handling
 * a particular {@link Ext.data.Api} action within the DWR proxy.
 * @constructor
 * @param {Object} config The configuration object for the ActionHandler.
 * @cfg {String} action [Required] The {@link Ext.data.Api} action (e.g., 'read', 'create') this handler is configured for.
 * @cfg {Function} dwrFunction [Required] The DWR-generated JavaScript function to be called for this action.
 * @cfg {Function} getDwrArgsFunction [Optional] A custom function to generate the arguments for the `dwrFunction`.
 * This function will receive the following parameters:
 * - `request`: An {@link Ext.ux.data.DataProxy.Request} object, useful for all action types.
 * - `recordDataArray`: An array of {@link Ext.data.Record#data} objects containing current (dirty) values for write actions.
 * - `recordDataBeforeUpdateArray`: An array of {@link Ext.data.Record#data} objects representing pre-update values (for 'update' actions).
 * The `getDwrArgsFunction` must return an `Array` of arguments in the precise order expected by the `dwrFunction`.
 * If omitted, default argument generation functions from {@link #defaultGetDwrArgsFunctions} will be used.
 * @cfg {Object} getDwrArgsScope [Optional] The scope in which `getDwrArgsFunction` will be executed. Defaults to `Object`.
 */
Ext.ux.data.DwrProxy.ActionHandler = function ( config ) {
    Ext.apply( this, config ); // Apply the provided configuration to this instance.

    if ( !this.action ) {
        throw new Exception( '"action" is not defined.' );
    }
    if ( !Ext.data.Api.isAction( this.action ) ) {
        throw new Exception( this.action + ' is not a valid Ext.data.Api action.' );
    }
    if ( !this.dwrFunction ) {
        throw new Exception( '"dwrFunction" is not defined.' );
    }

    // Assign default argument generation function if not explicitly provided.
    if ( !this.getDwrArgsFunction ) {
        this.getDwrArgsFunction = this.defaultGetDwrArgsFunctions[this.action];
    }
    // Set default scope if not explicitly provided.
    if ( !this.getDwrArgsScope ) {
        this.getDwrArgsScope = Object;
    }
};

Ext.extend( Ext.ux.data.DwrProxy.ActionHandler, Object, {

    /*
     * Private properties: Contains default functions for DWR argument generation based on action type.
     */
    defaultGetDwrArgsFunctions : {
        /**
         * Default argument generator for 'read' actions.
         * @return {Array} An empty array, indicating no custom arguments are passed to the read dwrFunction.
         * @private
         */
        read : function ( ) {
            return [];
        },

        /**
         * Default argument generator for 'create' actions.
         * @param {Ext.ux.data.DataProxy.Request} request The request object.
         * @param {Array} recordDataArray An array of {@link Ext.data.Record#data} objects to be created.
         * @return {Object[]} The `recordDataArray` wrapped in another array, suitable for a DWR function expecting a single list parameter.
         * @private
         */
        create : function ( request, recordDataArray ) {
            return [ recordDataArray ];
        },

        /**
         * Default argument generator for 'update' actions.
         * @param {Ext.ux.data.DataProxy.Request} request The request object.
         * @param {Array} recordDataArray An array of {@link Ext.data.Record#data} objects with updated values.
         * @param {Array} oldRecordDataArray An array of {@link Ext.data.Record#data} objects with original values.
         * @return {Object[]} An array containing `oldRecordDataArray` and `recordDataArray`,
         * for a DWR function expecting two list parameters (old values, new values).
         * @private
         */
        update : function ( request, recordDataArray, oldRecordDataArray ) {
            return [ oldRecordDataArray, recordDataArray ];
        },

        /**
         * Default argument generator for 'destroy' actions.
         * @param {Ext.ux.data.DataProxy.Request} request The request object.
         * @param {Array} recordDataArray An array of {@link Ext.data.Record#data} objects to be destroyed.
         * @return {Object[]} The `recordDataArray` wrapped in another array, for a DWR function expecting a single list parameter.
         * @private
         */
        destroy : function ( request, recordDataArray ) {
            return [ recordDataArray ];
        }
    }
} );


Ext.namespace( "Ext.ux.data.DataProxy" ); // Ensure the sub-namespace for DataProxy utilities is created.

/**
 * @class Ext.ux.data.DataProxy.Request
 * A utility class that encapsulates all parameters passed to {@link Ext.data.DataProxy#request}.
 * This provides a convenient way to pass request context between methods.
 * @constructor
 * @param {String} action The CRUD action type ('create', 'read', 'update', 'destroy'). (Note: Only 'read' is fully supported in some contexts.)
 * @param {Ext.data.Record/Ext.data.Record[]} records The record(s) involved in the action. Null for 'read' actions.
 * @param {Object} params An object containing key-value pairs to be sent as request parameters to the server.
 * @param {Ext.data.DataReader} reader The {@link Ext.data.DataReader} instance used to convert server responses into a 'readDataBlock'.
 * @param {Function} callback The function to be invoked after the request completes.
 * The callback signature is: `(readDataBlock, options, success)`.
 * <ul>
 * <li>`readDataBlock`: The data object resulting from {@link Ext.data.DataReader#read}.</li>
 * <li>`options`: The options object provided to the request.</li>
 * <li>`success`: A boolean indicating the success status of the request.</li>
 * </ul>
 * @param {Object} scope The execution scope (`this` context) for the `callback` function.
 * @param {Object} options An optional object containing additional configuration or data, passed as the second argument to the callback.
 */
Ext.ux.data.DataProxy.Request = function ( action, records, params, reader, callback, scope, options ) {
    Ext.apply( this, { // Apply all constructor arguments as properties of this instance.
        action : action,
        records : records,
        params : params,
        reader: reader,
        callback : callback,
        scope : scope,
        options : options
    } );
};