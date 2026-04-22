/*
 * This file defines the ZooKeeper class, which acts as a wrapper around the native Node.js ZooKeeper binding.
 * It extends EventEmitter to provide an event-driven interface for ZooKeeper operations.
 */
var EventEmitter =  require (  'events'  ).EventEmitter; // Core Node.js event emitter
var util         =  require (  'util'  );                 // Node.js utility module
var _            =  require (  'underscore'  );           // Underscore.js utility library
var path         =  require (  'path'  );                 // Node.js path module for path manipulation
var async        =  require (  'async'  );                // Async library for flow control
// The native C++ ZooKeeper binding. Path is relative to the current directory.
var NativeZk     =  require (  __dirname  +  '/../build/zookeeper.node'  ).ZooKeeper;



// With Node.js versions 0.5.x and newer, the EventEmitter implementation is purely JavaScript.
// This design uses a straightforward wrapper pattern.
// Inspiration for this wrapper partly comes from the approach seen in:
// https://github.com/bnoordhuis/node-event-emitter

/*
 ********************************************************************************
 * Constructor Function for the ZooKeeper Wrapper Class
 ********************************************************************************
 */

// Export the ZooKeeper class, making it the primary export of this module.
exports  =  module.exports  =  ZooKeeper;

/**
 * Initializes a new ZooKeeper client instance.
 * @param {string|object} config - Configuration string (e.g., 'localhost:2181') or an object with connection details.
 */
function ZooKeeper(config)
{
    var self  =  this;

    // If a string is provided, assume it's the connection string and wrap it in a config object.
    if  (  _.isString(config)  )
    {
        config  =  {  connect:  config  };
    }

    // Store the configuration.
    self.config  =  config;

    // Instantiate the underlying native ZooKeeper object.
    self._native  =  new NativeZk();

    // Override the native object's 'emit' method to intercept and modify events before re-emitting.
    self._native.emit  =  function(ev, a1, a2, a3)
    {
        // If a logger is configured, log the event emission.
        if  (  self.logger  )
            self.logger  (  "Emitting '"  +  ev  +  "' with args: "  +  a1  +  ", "  +  a2  +  ", "  +  a3  );

        // For 'connect' or 'close' events, the native object typically passes itself.
        // We need to substitute it with the wrapper object (`self`) for consistency.
        if  (  ev  ===  'connect'  ||  ev  ===  'close'  )
        {
            a1  =  self; // Replace the native object with the wrapper instance.
        }

        // Re-emit the event using the wrapper's EventEmitter capabilities.
        self.emit  (  ev,  a1,  a2,  a3  );
    }



    /*
     ********************************************************************************
     * Public Properties Definition
     * These properties are proxied directly to the native ZooKeeper object.
     ********************************************************************************
     */

    /**
     * Creates a getter and setter for a property, forwarding requests to the native object.
     * @param {string} name - The name of the property to proxy.
     */
    function proxyProperty(name)
    {
        // Define a getter for the property.
        self.__defineGetter__  (  name,  function()
        {
            return  self._native[name];
        });

        // Define a setter for the property.
        self.__defineSetter__  (  name,  function(val)
        {
            self._native[name]  =  val;
        });
    }

    // Apply proxying to key state-related properties.
    proxyProperty  (  'state'  );
    proxyProperty  (  'timeout'  );
    proxyProperty  (  'client_id'  );
    proxyProperty  (  'client_password'  );
    proxyProperty  (  'is_unrecoverable'  );

    // Initialize encoding. By default, data is returned as Buffer objects.
    self.encoding  =  null;  // A 'null' encoding implies Buffer objects.

    /**
     * Sets the encoding for data returned by ZooKeeper operations.
     * If set to null, data will be returned as Buffer objects.
     * @param {string|null} val - The desired encoding (e.g., 'utf8', 'ascii') or null for Buffer.
     */
    self.setEncoding  =  function setEncoding(val)
    {
        self.encoding  =  val;
    };

    // Provide backwards compatibility for the 'data_as_buffer' property.
    // This property is deprecated; 'setEncoding()' should be used instead.
    self.__defineGetter__  (  'data_as_buffer',  function()
    {
        // If an encoding is set, data is NOT a buffer (it's a string).
        // If no encoding (null), data IS a buffer.
        return  self.encoding  ?  false  :  true;
    });

    self.__defineSetter__  (  'data_as_buffer',  function(data_as_buffer)
    {
        // If 'data_as_buffer' is true, set encoding to null (returns Buffer).
        // Otherwise (false), set encoding to 'utf8' as a default for string data.
        self.encoding  =  (  (data_as_buffer  ==  true)  ?  null  :  'utf8'  );
    });

} // End of ZooKeeper constructor function.

// Inherit EventEmitter prototype methods into ZooKeeper.
util.inherits  (  ZooKeeper,  EventEmitter  );


/*
 ********************************************************************************
 * Constants Definition for ZooKeeper Operations and States
 ********************************************************************************
 */

// Event constants (for backwards compatibility; direct string usage is preferred).
exports.on_closed             =  'close';          // Event emitted when the connection is closed.
exports.on_connected          =  'connect';        // Event emitted when successfully connected to ZooKeeper.
exports.on_connecting         =  'connecting';     // Event emitted while attempting to connect.
exports.on_event_created      =  'created';        // Event for node creation.
exports.on_event_deleted      =  'deleted';        // Event for node deletion.
exports.on_event_changed      =  'changed';        // Event for node data change.
exports.on_event_child        =  'child';          // Event for child list change.
exports.on_event_notwatching  =  'notwatching';    // Event for watcher removal.

// Other constants are directly exposed from the native ZooKeeper binding.
for  (  var key  in  NativeZk  )
{
    exports[key]  =  NativeZk[key];
    // console.log(key + " = " + exports[key]); // Debugging line, commented out.
}

/*
 * Notable Constants provided by the Native ZooKeeper Library:
 *
 * Permissions:
 *  * ZOO_PERM_READ              =  1    // Read permission
 *  * ZOO_PERM_WRITE             =  2    // Write permission
 *  * ZOO_PERM_CREATE            =  4    // Create permission
 *  * ZOO_PERM_DELETE            =  8    // Delete permission
 *  * ZOO_PERM_ADMIN             =  16   // Admin permission
 *  * ZOO_PERM_ALL               =  31   // All permissions combined
 *
 * States:
 *  * ZOO_EXPIRED_SESSION_STATE  =  -112 // Session expired
 *  * ZOO_AUTH_FAILED_STATE      =  -113 // Authentication failed
 *  * ZOO_CONNECTING_STATE       =  1    // Currently connecting
 *  * ZOO_ASSOCIATING_STATE      =  2    // Associating with a server
 *  * ZOO_CONNECTED_STATE        =  3    // Successfully connected
 *
 * Log Levels:
 *  * ZOO_LOG_LEVEL_ERROR        =  1    // Error messages
 *  * ZOO_LOG_LEVEL_WARN         =  2    // Warning messages
 *  * ZOO_LOG_LEVEL_INFO         =  3    // Informational messages
 *  * ZOO_LOG_LEVEL_DEBUG        =  4    // Debugging messages
 *
 * API Responses (Return Codes):
 *  * ZOK                        =  0    // Operation successful
 *  * ZSYSTEMERROR               =  -1   // System error
 *  * ZRUNTIMEINCONSISTENCY      =  -2   // Runtime inconsistency
 *  * ZDATAINCONSISTENCY         =  -3   // Data inconsistency
 *  * ZCONNECTIONLOSS            =  -4   // Connection to ZooKeeper server lost
 *  * ZMARSHALLINGERROR          =  -5   // Error marshalling/unmarshalling data
 *  * ZUNIMPLEMENTED             =  -6   // Feature not implemented
 *  * ZOPERATIONTIMEOUT          =  -7   // Operation timed out
 *  * ZBADARGUMENTS              =  -8   // Invalid arguments
 *  * ZINVALIDSTATE              =  -9   // Invalid ZooKeeper state
 *  * ZAPIERROR                  =  -100 // API error
 *  * ZNONODE                    =  -101 // Node does not exist
 *  * ZNOAUTH                    =  -102 // Not authenticated
 *  * ZBADVERSION                =  -103 // Bad version specified
 *  * ZNOCHILDRENFOREPHEMERALS   =  -108 // Cannot create children of ephemeral nodes
 *  * ZNODEEXISTS                =  -110 // Node already exists
 *  * ZNOTEMPTY                  =  -111 // Directory is not empty
 *  * ZSESSIONEXPIRED            =  -112 // Session expired
 *  * ZINVALIDCALLBACK           =  -113 // Invalid callback function
 *  * ZINVALIDACL                =  -114 // Invalid ACL specified
 *  * ZAUTHFAILED                =  -115 // Authentication failed
 *  * ZCLOSING                   =  -116 // ZooKeeper is closing
 *  * ZNOTHING                   =  -117 // No specific error (used internally)
 *  * ZSESSIONMOVED              =  -118 // Session moved to another server
 *
 * Other ZNode Flags:
 *  * ZOO_EPHEMERAL              =  1    // Ephemeral node flag
 *  * ZOO_SEQUENCE               =  2    // Sequential node flag
 *
 */


/*
 ********************************************************************************
 * Prototype Methods for the ZooKeeper Class
 * These methods wrap the native ZooKeeper client's functionality.
 ********************************************************************************
 */

/**
 * Configures the logger for the ZooKeeper instance.
 * @param {function|boolean} logger - A function to use for logging, `true` for default console logger, `false` to disable.
 * @throws {Error} If logger is not a function or boolean.
 */
ZooKeeper.prototype.setLogger  =  function(logger)
{
    if  (  logger  ===  true  )
    {
        // Use a default console logger if `true` is passed.
        this.logger  =  function logger(str)
        {
            console.log  (  "ZOOKEEPER_LOG: "  +  str  );
        }
    }
    else  if  (  logger  ===  false  )
    {
        // Disable logging if `false` is passed.
        this.logger  =  undefined;
    }
    else  if  (  _.isFunction(logger)  )
    {
        // Use the provided function as the logger.
        this.logger  =  logger;
    }
    else
    {
        // Throw an error for invalid logger arguments.
        throw  new Error  (  "InvalidArgument: logger must be a function or true/false to utilize default logger"  );
    }
}

/**
 * Initializes the connection to ZooKeeper. This method can be called multiple times with new config.
 * @param {string|object} [config] - Optional new configuration to merge or use.
 * @returns {ZooKeeper} The current ZooKeeper wrapper instance for chaining.
 */
ZooKeeper.prototype.init  =  function init(config)
{
    var self  =  this;

    // Normalize config if a string connection path is provided.
    if  (  _.isString(config)  )
    {
        config  =  {  connect:  config  };
    }

    // Merge new config with existing config, if any.
    if  (  self.config  )
    {
        config  =  config  ?  _.defaults(config,  self.config)  :  self.config;
    }

    // Log the initiation call if logger is enabled.
    if  (  this.logger  )  this.logger  (  "Calling init with "  +  util.inspect(arguments)  );

    // Handle deprecated 'data_as_buffer' in config.
    if  (  !  _.isUndefined(config.data_as_buffer)  )
    {
        self.data_as_buffer  =  config.data_as_buffer;
        if  (  this.logger  )  this.logger  (  "Encoding for data output: %s",  self.encoding  );
    }

    // Call the native init method.
    this._native.init.call  (  this._native,  config  );

    // The native code returns a reference to itself.
    // We should return a reference to the wrapper object for consistency in the API.
    return  self;
}

/**
 * Connects to the ZooKeeper ensemble.
 * @param {object} [options] - Connection options, passed to init.
 * @param {function} cb - Callback function (err, zk_client).
 */
ZooKeeper.prototype.connect  =  function connect(options,  cb)
{
    var self  =  this;

    // Handle optional 'options' argument.
    if  (  _.isFunction(options)  )
    {
        cb  =  options;
        options  =  null;
    }

    // Initialize with provided options.
    self.init  (  options  );

    /**
     * Error handler for the connection process.
     * @param {Error} err - The error object.
     */
    function errorHandler(err)
    {
        self.removeListener  (  'error',  errorHandler  );    // Clean up error listener.
        self.removeListener  (  'connect',  connectHandler  ); // Clean up connect listener.
        cb  (  err  );
    }

    /**
     * Success handler for the connection process.
     */
    function connectHandler()
    {
        self.removeListener  (  'error',  errorHandler  );    // Clean up error listener.
        self.removeListener  (  'connect',  connectHandler  ); // Clean up connect listener.
        cb  (  null,  self  );
    }

    // Attach listeners for connection events.
    self.on  (  'error',  errorHandler  );
    self.on  (  'connect',  connectHandler  );

    /*
     * The following commented-out block was initially added by vincent-zhao.
     * It has been commented out to maintain previous behavior or due to issues.
     *
     * self.a_get('/',false,function(rc,error,stat,data){
     *   if(rc != 0){
     *     cb(error);
     *   }
     * });
     */
}

/**
 * Closes the connection to the ZooKeeper ensemble.
 * @returns {number} The result code from the native close operation.
 */
ZooKeeper.prototype.close  =  function close()
{
    if  (  this.logger  )  this.logger  (  "Calling close with "  +  util.inspect(arguments)  );
    return  this._native.close.apply  (  this._native,  arguments  );
}

/**
 * Asynchronously creates a new ZNode.
 * @param {string} path - The path of the ZNode to create.
 * @param {Buffer|string} data - The data to store in the ZNode.
 * @param {number} flags - Creation flags (e.g., ephemeral, sequential).
 * @param {function} cb - Callback function (rc, error, zkPath).
 * @returns {number} The result code from the native create operation.
 */
ZooKeeper.prototype.a_create  =  function a_create()
{
    if  (  this.logger  )  this.logger  (  "Calling a_create with "  +  util.inspect(arguments)  );
    return  this._native.a_create.apply  (  this._native,  arguments  );
}

/**
 * Asynchronously checks for the existence of a ZNode.
 * @param {string} path - The path of the ZNode to check.
 * @param {boolean} watch - Whether to set a watch on the ZNode.
 * @param {function} cb - Callback function (rc, error, stat).
 * @returns {number} The result code from the native exists operation.
 */
ZooKeeper.prototype.a_exists  =  function a_exists()
{
    if  (  this.logger  )  this.logger  (  "Calling a_exists with "  +  util.inspect(arguments)  );
    return  this._native.a_exists.apply  (  this._native,  arguments  );
}

/**
 * Asynchronously checks for the existence of a ZNode and sets a watcher.
 * @param {string} path - The path of the ZNode to check.
 * @param {function} watch_cb - The watcher callback function.
 * @param {function} data_cb - The data callback function (rc, error, stat).
 * @returns {number} The result code from the native exists operation.
 */
ZooKeeper.prototype.aw_exists  =  function aw_exists()
{
    if  (  this.logger  )  this.logger  (  "Calling aw_exists with "  +  util.inspect(arguments)  );
    return  this._native.aw_exists.apply  (  this._native,  arguments  );
}

/**
 * Asynchronously retrieves the data and status of a ZNode.
 * @param {string} path - The path of the ZNode.
 * @param {boolean} watch - Whether to set a watch on the ZNode.
 * @param {function} data_cb - Callback function (rc, error, stat, data).
 * @returns {number} The result code from the native get operation.
 */
ZooKeeper.prototype.a_get  =  function a_get(path,  watch,  data_cb)
{
    var self  =  this;
    if  (  this.logger  )  this.logger  (  "Calling a_get with "  +  util.inspect(arguments)  );

    // Call the native get method and intercept the callback to handle encoding.
    return  this._native.a_get.call  (  this._native,  path,  watch,  function(rc,  error,  stat,  data)
    {
        // If data exists and an encoding is set, convert the Buffer to a string.
        if  (  data  &&  self.encoding  )
        {
            data  =  data.toString  (  self.encoding  );
        }
        data_cb  (  rc,  error,  stat,  data  ); // Invoke the original data callback.
    });
}

/**
 * Asynchronously retrieves the data and status of a ZNode and sets a watcher.
 * @param {string} path - The path of the ZNode.
 * @param {function} watch_cb - The watcher callback function.
 * @param {function} data_cb - The data callback function (rc, error, stat, data).
 * @returns {number} The result code from the native get operation.
 */
ZooKeeper.prototype.aw_get  =  function aw_get(path,  watch_cb,  data_cb)
{
    var self  =  this;
    if  (  this.logger  )  this.logger  (  "Calling aw_get with "  +  util.inspect(arguments)  );

    // Call the native get method with a watcher and intercept the data callback.
    return  this._native.aw_get.call  (  this._native,  path,  watch_cb,  function(rc,  error,  stat,  data)
    {
        // If data exists and an encoding is set, convert the Buffer to a string.
        if  (  data  &&  self.encoding  )
        {
            data  =  data.toString  (  self.encoding  );
        }
        data_cb  (  rc,  error,  stat,  data  ); // Invoke the original data callback.
    });
}

/**
 * Asynchronously retrieves the list of children for a ZNode.
 * @param {string} path - The path of the parent ZNode.
 * @param {boolean} watch - Whether to set a watch on the ZNode's children.
 * @param {function} cb - Callback function (rc, error, children).
 * @returns {number} The result code from the native get_children operation.
 */
ZooKeeper.prototype.a_get_children  =  function a_get_children()
{
    if  (  this.logger  )  this.logger  (  "Calling a_get_children with "  +  util.inspect(arguments)  );
    return  this._native.a_get_children.apply  (  this._native,  arguments  );
}

/**
 * Asynchronously retrieves the list of children for a ZNode and sets a watcher.
 * @param {string} path - The path of the parent ZNode.
 * @param {function} watch_cb - The watcher callback function.
 * @param {function} data_cb - The data callback function (rc, error, children).
 * @returns {number} The result code from the native get_children operation.
 */
ZooKeeper.prototype.aw_get_children  =  function aw_get_children()
{
    if  (  this.logger  )  this.logger  (  "Calling aw_get_children with "  +  util.inspect(arguments)  );
    return  this._native.aw_get_children.apply  (  this._native,  arguments  );
}

/**
 * Asynchronously retrieves the list of children and status for a ZNode.
 * @param {string} path - The path of the parent ZNode.
 * @param {boolean} watch - Whether to set a watch on the ZNode's children.
 * @param {function} cb - Callback function (rc, error, children, stat).
 * @returns {number} The result code from the native get_children2 operation.
 */
ZooKeeper.prototype.a_get_children2  =  function a_get_children2()
{
    if  (  this.logger  )  this.logger  (  "Calling a_get_children with "  +  util.inspect(arguments)  );
    return  this._native.a_get_children2.apply  (  this._native,  arguments  );
}

/**
 * Asynchronously retrieves the list of children and status for a ZNode and sets a watcher.
 * @param {string} path - The path of the parent ZNode.
 * @param {function} watch_cb - The watcher callback function.
 * @param {function} data_cb - The data callback function (rc, error, children, stat).
 * @returns {number} The result code from the native get_children2 operation.
 */
ZooKeeper.prototype.aw_get_children2  =  function aw_get_children2()
{
    if  (  this.logger  )  this.logger  (  "Calling aw_get_children with "  +  util.inspect(arguments)  );
    return  this._native.aw_get_children2.apply  (  this._native,  arguments  );
}

/**
 * Asynchronously sets the data for a ZNode.
 * @param {string} path - The path of the ZNode.
 * @param {Buffer|string} data - The new data to set.
 * @param {number} version - The expected version of the ZNode.
 * @param {function} cb - Callback function (rc, error, stat).
 * @returns {number} The result code from the native set operation.
 */
ZooKeeper.prototype.a_set  =  function a_set()
{
    if  (  this.logger  )  this.logger  (  "Calling a_set with "  +  util.inspect(arguments)  );
    return  this._native.a_set.apply  (  this._native,  arguments  );
}

/**
 * Asynchronously deletes a ZNode.
 * @param {string} path - The path of the ZNode to delete.
 * @param {number} version - The expected version of the ZNode.
 * @param {function} cb - Callback function (rc, error).
 * @returns {number} The result code from the native delete operation.
 */
ZooKeeper.prototype.a_delete_  =  function a_delete_()
{
    if  (  this.logger  )  this.logger  (  "Calling a_delete_ with "  +  util.inspect(arguments)  );
    return  this._native.a_delete_.apply  (  this._native,  arguments  );
}

/**
 * Asynchronously retrieves the Access Control List (ACL) for a ZNode.
 * @param {string} path - The path of the ZNode.
 * @param {function} cb - Callback function (rc, error, acl, stat).
 * @returns {number} The result code from the native get_acl operation.
 */
ZooKeeper.prototype.a_get_acl  =  function a_get_acl ()
{
    if  (  this.logger  )  this.logger  (  "Calling a_get_acl with "  +  util.inspect(arguments)  );
    return  this._native.a_get_acl.apply  (  this._native,  arguments  );
};

/**
 * Asynchronously sets the Access Control List (ACL) for a ZNode.
 * @param {string} path - The path of the ZNode.
 * @param {number} version - The expected version of the ZNode.
 * @param {array} acl - The new ACL array.
 * @param {function} cb - Callback function (rc, error).
 * @returns {number} The result code from the native set_acl operation.
 */
ZooKeeper.prototype.a_set_acl  =  function a_get_acl ()
{
    if  (  this.logger  )  this.logger  (  "Calling a_set_acl with "  +  util.inspect(arguments)  );
    return  this._native.a_set_acl.apply  (  this._native,  arguments  );
};

/**
 * Asynchronously adds authentication credentials to the ZooKeeper session.
 * @param {string} scheme - The authentication scheme (e.g., 'digest').
 * @param {Buffer} cert - The authentication credentials.
 * @param {function} cb - Callback function (rc, error).
 * @returns {number} The result code from the native add_auth operation.
 */
ZooKeeper.prototype.add_auth  =  function a_get_acl ()
{
    if  (  this.logger  )  this.logger  (  "Calling add_auth with "  +  util.inspect(arguments)  );
    return  this._native.add_auth.apply  (  this._native,  arguments  );
};

/**
 * Recursively creates a path of ZNodes, similar to `mkdir -p`.
 * @param {string} p - The path to create.
 * @param {function} cb - Callback function (err, success).
 * @returns {void}
 */
ZooKeeper.prototype.mkdirp  =  function  (p,  cb)
{
    if  (  this.logger  )  this.logger  (  "Calling mkdirp with "  +  util.inspect(arguments)  );
    return  mkdirp  (  this,  p,  cb  );
}

//
// ZK (ZooKeeper) does not inherently support relative paths like './file' or parent directory references like '/dir/../file'.
// This helper function `mkdirp` aims to create a directory path recursively.
// Example usage: mkdirp(zookeeperConnection, '/a/deep/path/to/a/file', cb)
//
/**
 * Recursively creates a path of ZNodes.
 * @param {ZooKeeper} con - The ZooKeeper connection instance.
 * @param {string} p - The path to create.
 * @param {function} callback - Callback function (err, success).
 */
function mkdirp(con,  p,  callback)
{
    p  =  path.normalize  (  p  ); // Normalize the path to handle redundancies.
    // Split the path into directories, removing the initial empty string from absolute paths.
    var dirs  =  p.split  (  '/'  ).slice  (  1  );

    // console.log('dirs', dirs); // Debugging line, commented out.

    var tasks  =  [];
    // For each directory segment, prepare an async task to create its corresponding ZNode.
    dirs.forEach  (  function(dir,  i)
    {
        // Construct the subpath for the current directory segment.
        var subpath  =  '/'  +  dirs.slice  (  0,  i  ).join  (  '/'  )  +  '/'  +  dir;
        subpath  =  path.normalize  (  subpath  ); // Normalize again to clean up intermediate paths.

        // Push an async task to create this subpath.
        tasks.push  (  async.apply  (  create,  con,  subpath  )  );
    });

    // Execute the creation tasks in sequence using async.waterfall.
    async.waterfall  (  tasks,  function(err,  results)
    {
        if  (  err  )  return  callback  (  err  ); // If any step fails, propagate the error.
        // If all steps succeeded, indicate success.
        return  callback  (  null,  true  );
    });
}

//
// Helper function to create a single ZNode.
// Usage: create(zookeeperConnection, '/some-path', cb)
// If there is a problem during creation:
//    cb(error)
// If the directory was created successfully or already exists:
//    cb() (with no arguments or null for error)
//
/**
 * Creates a single ZNode at the given path.
 * @param {ZooKeeper} con - The ZooKeeper connection instance.
 * @param {string} p - The path of the ZNode to create.
 * @param {function} cb - Callback function (err).
 */
function create(con,  p,  cb)
{
    var data  =  'created by zk-mkdir-p'; // Default data for the created ZNode.
    var flags  =  0; // No special flags (e.g., ephemeral, sequential) for directory creation.

    // Attempt to create the ZNode.
    con.a_create  (  p,  data,  flags,  function(rc,  error,  zkPath)
    {
        // If the ZNode already exists, consider it a success and proceed.
        if  (  rc  ==  ZooKeeper.ZNODEEXISTS  )
        {
            return  cb  (  );
        }
        // If any other error occurs, return an error.
        if  (  rc  !=  0  )
        {
            return  cb  (  new Error  (  'Zookeeper Error: code='  +  rc  +  '   '  +  error  )  );
        }
        // If creation was successful.
        return  cb  (  );
    });
}