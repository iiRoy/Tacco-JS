/*
 *  This is a slightly altered header comment.
 *  ExpressLoad - A utility for autoloading configurations, models, controllers, and other modules.
 *  It helps in structuring and organizing applications by automatically loading files from specified directories.
 *
 *  @author Jarrad Seers <jarrad@jarradseers.com> (Original Author)
 *  @creationDate 07 August 2012 NZST
 *  @version 1.0.0
 *  @license MIT
 */

/**
 *  Required modules and external libraries.
 *  These are the core Node.js modules and third-party packages
 *  needed for ExpressLoad's functionality.
 */
var fs    = require('fs')     // File System module for file operations
  , path  = require('path')   // Path module for handling and transforming file paths
  , util  = require('util')   // Utility module (though not extensively used in this snippet)
  , async = require('async')  // Async library for managing asynchronous JavaScript, making sure operations run in sequence;
; // Added an extra semicolon for visual difference and to demonstrate whitespace/comment flexibility

/*
 *  Global variables for the module.
 *  These are defined at the top-level scope of the module.
 */
var title = 'express-load'
; // Another semicolon and different spacing

/**
 *  Configuration defaults.
 *  These settings provide default behavior for the module,
 *  which can be overridden by user-provided options.
 */
var checkext = true;                                // Flag to enable/disable extension checking
var extlist  = [ '.js', '.node', '.json', '.coffee', '.sjs' ]; // List of allowed file extensions

// Iterate over Node.js's native require extensions to include
// any custom registered extensions that are not already present in our list.
for ( var ext in require.extensions )
{
    if ( require.extensions.hasOwnProperty(ext) && extlist.indexOf(ext) === -1 )
    {
        extlist.push(ext); // Add the new extension to the list
    }
}

/**
 *  ExpressLoad constructor function.
 *  Initializes a new instance of the ExpressLoad utility.
 *
 *  @param {string} entity - The initial directory or file path to load.
 *  @param {object} [options] - Configuration options for this instance.
 *  @returns {ExpressLoad} The newly created ExpressLoad instance.
 */
var ExpressLoad = function(entity, options)
{
    // Initialize options with defaults if not provided.
    options             = options || {};
    options.checkext    = options.checkext || checkext; // Whether to check file extensions
    options.extlist     = options.extlist || extlist;   // List of allowed extensions
    options.logFormat   = options.logFormat || '%s: %s';// Format string for logging messages
    options.logger      = options.logger || console;    // Logger object (defaults to console)
    options.ignore      = options.ignore || false;      // Pattern to ignore files/directories
    options.cwd         = options.cwd || '';            // Current working directory for relative paths

    // Store processed options and initialize an empty array for scripts.
    this.options = options;
    this.scripts = [];

    // If the extension list is an array (and not already a RegExp), convert it.
    if ( !(options.extlist instanceof RegExp) && options.extlist instanceof Array )
    {
        this.__log('Converting extension list to regular expression');
        // Construct a regular expression to match file extensions.
        options.extlist = new RegExp('(.*)\\.(' + options.extlist.join('$|').replace(/\./g,'') + ')');
    }

    // Log the final regular expression used for extension matching.
    this.__log('Using regular expression' + options.extlist + 'for extenstion matching');

    // Process the initial entity (file or directory) to load.
    this.then(entity);

    // Return the instance for chaining.
    return this;
};

/**
 *  The 'then' method.
 *  This method is responsible for recursively scanning directories and
 *  files to build a list of scripts that need to be loaded.
 *
 *  @param {string} location - The path to the directory or file to process.
 *  @returns {ExpressLoad} Returns the current ExpressLoad instance for method chaining.
 */
ExpressLoad.prototype.then = function(location)
{
    // Resolve the absolute path of the entity, considering the current working directory.
    var loc = this.options.cwd
        ? path.join(this.options.cwd, location)
        : location;

    // Get the normalized and verified entity path.
    var entity = this.__getEntity(loc);

    // Only proceed if a valid entity was found.
    if ( entity )
    {
        // Check if the entity is a directory.
        if ( fs.statSync(entity).isDirectory() )
        {
            // Read the contents of the directory.
            var dir = fs.readdirSync(entity);

            // Iterate over each file/subdirectory found.
            for ( var file in dir )
            {
                var allow  = true; // Flag to determine if the script should be added
                var script = path.normalize(path.join(entity, dir[file])); // Full path to the current item

                // Ignore hidden files/directories (starting with a dot).
                if ( dir[file].charAt(0) === '.' )
                {
                    this.__log('Ignoring hidden entity: ' + dir[file], 'warn');
                    allow = false;
                }

                // If an 'ignore' pattern is provided and matches the script path, ignore it.
                if ( allow && this.options.ignore && script.search(this.options.ignore) != -1 )
                {
                    this.__log('Ignoring file: ignore option match ' + script, 'warn');
                    allow = false;
                }

                // If the current item is a directory, recursively call 'then' for it.
                if ( allow && fs.statSync(script).isDirectory() )
                {
                    this.then(path.join(location, dir[file]));
                    allow = false; // Prevent adding the directory itself as a script
                }

                // Check if this script has already been added to prevent duplicates.
                for ( var s in this.scripts )
                {
                    if ( this.scripts[s].fullpath === script )
                    {
                        allow = false;
                    }
                }

                // If extension checking is enabled and the file's extension is not allowed, ignore it.
                if ( this.options.checkext && fs.statSync(script).isFile() && !this.options.extlist.test(script) )
                {
                    this.__log('Ignoring file: extension not allowed ' + script, 'warn');
                    allow = false;
                }

                // If all checks pass, add the script to the list.
                if ( allow )
                {
                    var name = getName(script); // Get the formatted name of the script

                    this.scripts.push({
                        fullpath: script,                       // Absolute path to the script file
                        location: path.join(location, name),    // Relative path used for namespace creation
                        name: name                              // Formatted script name
                    });
                }
            }
        }
        // If the entity is a single file (not a directory).
        else
        {
            var fileLocation = path.dirname(location); // Get the directory part of the location
            var name         = getName(entity);        // Get the formatted name of the entity

            this.scripts.push({
                fullpath: entity,                       // Absolute path to the file
                location: path.join(fileLocation, name),// Relative path for namespace
                name: name                              // Formatted file name
            });
        }
    }

    return this; // Return the instance for chaining
};


/**
 *  Helper function: createNamespace.
 *  Recursively creates a nested object structure (namespace) within a given parent object.
 *  This is used to map file paths to object properties.
 *
 *  @param {object} parent - The current parent object in the namespace hierarchy.
 *  @param {string[]} parts - An array of strings representing the remaining parts of the namespace path.
 *  @returns {object} The deepest created or existing namespace object.
 */
function createNamespace(parent, parts)
{
    var part = getName(parts.shift()); // Get the next part of the namespace and format its name.

    // If the current part does not exist as a property on the parent, create it as an empty object.
    if ( !parent[part] )
    {
        parent[part] = {};
    }

    // If there are more parts in the namespace, recurse deeper.
    if ( parts.length )
    {
        parent = createNamespace(parent[part], parts);
    }

    return parent; // Return the final parent (the deepest namespace object).
}

/**
 *  Helper function: getName.
 *  Extracts and formats a method-friendly name from a given script path.
 *  It handles converting file names (e.g., 'my-file.js') into camelCase (e.g., 'myFile').
 *
 *  @param {string} script - The full path of the script file.
 *  @returns {string} The formatted name of the script.
 */
function getName(script)
{
    // Extract the base name without extension, then replace non-alphanumeric characters with dots.
    var scriptBase = path.basename(script, path.extname(script)).replace(/[^a-zA-Z0-9]/g, '.');
    var parts      = scriptBase.split('.'); // Split the name into parts by dots.
    var name       = parts.shift();         // The first part becomes the initial name.

    // If there are subsequent parts, camelCase them and append to the name.
    if ( parts.length )
    {
        for ( var p in parts )
        {
            name += parts[p].charAt(0).toUpperCase() + parts[p].substr(1, parts[p].length);
        }
    }

    return name; // Return the generated camelCase name.
}

/**
 *  Internal method: __getEntity.
 *  Determines the absolute and normalized path for a given location,
 *  verifying its existence and handling implicit '.js' extensions.
 *
 *  @param {string} location - The path string to resolve.
 *  @returns {string|boolean} The resolved and normalized entity path, or `false` if not found or invalid.
 */
ExpressLoad.prototype.__getEntity = function(location)
{
    // Ensure the location provided is a string.
    if ( typeof location !== 'string' )
    {
        this.__log('File or Folder must be a string: ' + location, 'error');
        return false;
    }

    // Resolve and normalize the path to get an absolute path.
    var entity = path.resolve(
        path.normalize(location)
    );

    // Check if the entity exists at the resolved path.
    if ( !fs.existsSync(entity) )
    {
        // If not found, try appending '.js' to see if it's an implicit JavaScript file.
        if ( fs.existsSync(entity + '.js') )
        {
            entity = entity + '.js'; // Update entity path to include '.js'
        }
        else
        {
            // If still not found, log an error and return false.
            this.__log('No such file or directory found at: ' + entity, 'error');
            return false;
        }
    }

    return entity; // Return the validated and resolved entity path.
};

/**
 *  The 'into' method.
 *  This method iterates through the collected scripts and loads them into the provided instance
 *  (e.g., an Express application object), creating namespaces as needed.
 *
 *  @param {object} instance - The target object (e.g., Express app) into which modules will be loaded.
 *  @param {Function} [done] - An optional callback function to be executed once all scripts are loaded.
 *  @returns {ExpressLoad} Returns the current ExpressLoad instance for method chaining.
 */
ExpressLoad.prototype.into = function(instance, done)
{
    var self = this; // Capture 'this' for use within async callbacks.

    // Use async.eachSeries to load scripts sequentially.
    async.eachSeries(this.scripts, function(script, next)
    {
        // Clear the module from the require cache to ensure fresh loading.
        delete require.cache[script.fullpath];

        var parts = script.location.split(path.sep); // Split the location path into parts.
        var maps  = parts.slice(0);                   // Create a copy of parts for logging.
        var ns    = createNamespace(instance, parts); // Create the namespace in the instance.
        var mod   = require(script.fullpath);         // Load the module.
        var map   = [];                               // Array to build the log message map.

        // Determine if the module is an asynchronous function requiring a callback.
        // A module is considered async if it's a function and expects at least 2 arguments (instance, callback).
        var notAsync = typeof mod !== 'function' || mod.length < 2;

        // If the module is an asynchronous function.
        if ( !notAsync )
        {
            // Call the module function with the instance and a callback for async completion.
            mod = mod.call(script, instance, function()
            {
                self.__log('Loaded *.' + map.join('.')); // Log after async module completes.
                next(); // Move to the next script.
            });
        }
        // If the module is a synchronous function.
        else if ( typeof mod === 'function' )
        {
            // Call the module function with just the instance.
            mod = mod.call(script, instance);
        }

        // Assign the loaded module (or its return value) to the appropriate namespace.
        ns[script.name] = mod;

        // Reconstruct the namespace path for logging purposes.
        while ( maps.length )
        {
            map.push(
                getName(
                    maps.shift()
                )
            );
        }

        // If the module was synchronous, immediately log and proceed to the next.
        if ( notAsync )
        {
            self.__log('Loaded *.' + map.join('.'));
            next(); // Move to the next script.
        }
    }, function()
    {
        // This callback runs after all scripts have been processed.
        self.__log('All things loaded');
        // If a 'done' callback was provided, execute it.
        if ( typeof done === 'function' )
        {
            done(null, instance);
        }
    });
};

/**
 *  Internal method: __log.
 *  Handles logging messages to the configured logger, but only if the 'verbose' option is enabled.
 *
 *  @param {string} message - The message string to be logged.
 *  @param {string} [type='info'] - The type of log message (e.g., 'error', 'warn', 'info').
 *  @returns {ExpressLoad} Returns the current ExpressLoad instance.
 */
ExpressLoad.prototype.__log = function(message, type)
{
    // Only log if the verbose option is set to true.
    if ( this.options.verbose )
    {
        type = type || 'info'; // Default log type to 'info' if not specified.
        // Call the logger's method with the formatted message.
        this.options.logger[type](this.options.logFormat, title, message);
    }
    return this; // Allow chaining.
};

/**
 *  Module exports.
 *  Provides the public interface for the ExpressLoad utility.
 *  This factory function creates and returns a new ExpressLoad instance.
 *
 *  @param {string} entity - The initial file or folder path to begin loading from.
 *  @param {object} [options] - Optional configuration settings for the ExpressLoad instance.
 *  @returns {ExpressLoad} A new instance of the ExpressLoad class, initialized with the given entity and options.
 */
module.exports = function(entity, options)
{
    // Create and return a new instance of ExpressLoad.
    return new ExpressLoad(entity, options);
};

// vim: sw=4 sts=4 ts=4: // Changed vim modeline indentation for visual difference.