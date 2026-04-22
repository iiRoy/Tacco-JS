// This file implements a Webpack loader for JSCS (JavaScript Code Style) checker.
// It allows developers to enforce code style rules during the build process.

// Enable strict mode for better error handling and cleaner code.
'use strict';


    var fs       = require('fs'); // Core Node.js file system module for file operations.
    var strip    = require('strip-json-comments'); /* A utility to safely remove
                                                   comments from JSON strings,
                                                   important for .jscsrc files. */
var utils    = require('loader-utils'); // Webpack's utility functions for loaders.
var RcLoader = require('rcloader'); /* Module to find and load configuration files
                                         (e.g., .jscsrc) from the file system. */
var Checker  = require('jscs'); /* The actual JSCS code style checker library. */


/*
 * A simple utility function to extend an object with properties from
 * one or more other objects. This mimics `Object.assign` behavior
 * but is a custom, older implementation.
 * @param {object} obj - The target object to extend.
 * @param {...object} sources - One or more source objects whose properties
 *                              will be copied to the target.
 * @returns {object} The extended target object.
 */
var extend = function(obj)
{
    var source, prop, i, l; // Declare variables for the loop scope.

    // Iterate over all arguments starting from the second one,
    // which are the source objects whose properties need to be copied.
    for (i = 1, l = arguments.length; i < l; i += 1)
    {
        source = arguments[i]; // Get the current source object.

        // Loop through all enumerable properties of the source object.
        for (prop in source)
        {
            // Ensure the property is directly on the source object (not inherited).
            if (hasOwnProperty.call(source, prop))
            {
                obj[prop] = source[prop]; // Copy the property value to the target object.
            }
        }
    }

    return obj; // Return the modified target object.
};


/*
 * Initialize the RcLoader. This instance will be responsible for
 * locating and providing paths to `.jscsrc` configuration files.
 * It's configured to look for files named `.jscsrc`.
 * The `loader` function is a custom callback for `RcLoader` that
 * simply returns the path, as the actual file content reading
 * is handled by this loader.
 */
var rcLoader = new RcLoader('.jscsrc', null,
  {
    loader: function(path)
    {
        return path; // The custom loader simply returns the path.
    }
  }
);


/*
 * Synchronously loads the JSCS configuration for the current resource.
 * This method is used when the Webpack loader is running in synchronous mode.
 * @returns {object} The parsed JSCS configuration object.
 */
var loadConfigSync = function()
{
    // Determine the path to the .jscsrc file relevant to the current resource.
    var path = rcLoader.for(this.resourcePath);

    // If `rcLoader.for` returns something other than a string,
    // it means no .jscsrc file was found for the given resource path.
    if (typeof path !== 'string')
    {
        // In this case, return an empty configuration object.
        return {};
    }

    // Add the found configuration file as a dependency to Webpack.
    // This ensures Webpack will re-run the loader if the config file changes.
    this.addDependency(path);

    // Read the content of the configuration file synchronously.
    var file = fs.readFileSync(path, 'utf8');

    // Parse the JSON content of the file after stripping any comments.
    return JSON.parse(strip(file));
};


/*
 * Asynchronously loads the JSCS configuration for the current resource.
 * This is the preferred method for Webpack loaders, utilizing the `async` callback.
 * @param {Function} callback - The Webpack asynchronous callback function.
 */
var loadConfigAsync = function(callback)
{
    // Find the .jscsrc file asynchronously for the current resource path.
    rcLoader.for(this.resourcePath, function(err, path)
    {
        // Check if a valid configuration file path was returned.
        if (typeof path !== 'string')
        {
            // If no .jscsrc was found, call the callback with no error and an empty config.
            return callback(null, {});
        }

        // Add the configuration file as a dependency, so Webpack watches it for changes.
        this.addDependency(path);

        // Read the content of the configuration file asynchronously.
        fs.readFile(path, 'utf8', function(err, file)
        {
            var options; // Variable to hold the parsed options.

            // Proceed only if there was no error during file reading.
            if (!err)
            {
                try
                {
                    // Parse the JSON content, first stripping comments.
                    options = JSON.parse(strip(file));
                }
                catch (e)
                {
                    // If JSON parsing fails, capture the error.
                    err = e;
                }
            }
            // Invoke the main callback with any error and the parsed options.
            callback(err, options);
        });
    }.bind(this)); // Bind 'this' (the loader context) to the callback function.
};


/*
 * Performs the actual JSCS check on the provided source code.
 * This function merges configuration from various sources and then
 * runs the JSCS checker.
 * @param {string} source - The JavaScript source code to be checked.
 * @param {object} config - The base configuration object, typically from .jscsrc.
 */
var checkSource = function(source, config)
{
    // Merge options from Webpack's loader options (`this.options.jscs`)
    // into the configuration object. These take precedence over .jscsrc.
    var options = this.options.jscs;
    extend(config, options);

    // Parse and merge options from the loader query string (`this.query`).
    // These options take highest precedence.
    var query = utils.parseQuery(this.query);
    extend(config, query);

    // Extract and remove specific flags from the config that are
    // handled by the loader itself, not directly by the JSCS library.

    // Get the `emitErrors` flag and remove it from the config.
    var emitErrors = config.emitErrors;
    delete config.emitErrors;

    // Get the `failOnHint` flag and remove it from the config.
    var failOnHint = config.failOnHint;
    delete config.failOnHint;

    // Get any custom reporter function and remove it from the config.
    var reporter = config.reporter;
    delete config.reporter;

    // Instantiate the JSCS checker.
    var checker = new Checker();
    checker.registerDefaultRules(); // Load all built-in JSCS rules.
    checker.configure(config);      // Apply the merged configuration to the checker.

    // Run the code style check on the provided source string.
    var result = checker.checkString(source);

    // If the checker found any code style issues.
    if (!result.isEmpty())
    {
        // If a custom reporter function was provided in the configuration.
        if (reporter)
        {
            // Call the custom reporter, ensuring 'this' refers to the loader context.
            reporter.call(this, result);
        }
        else // Otherwise, use the default reporting mechanism.
        {
            // Format the list of errors into a human-readable message string.
            var message = result.getErrorList().map(function(error)
            {
                // Each error is formatted to show the rule, line, column, and message.
                return '  ' + error.rule +
                       ' @ line ' + error.line +
                       ' char ' + error.column +
                       '\n    ' + error.message;
            }).join('\n\n'); // Join multiple error messages with double newlines for readability.

            // Determine which Webpack emitter function to use (error or warning).
            var emitter = emitErrors ? this.emitError : this.emitWarning;

            // If the determined emitter function exists on the loader context.
            if (emitter)
            {
                // Emit the formatted message through Webpack.
                emitter('jscs results in errors\n' + message);
            }
            else // Fallback for environments that might not support `emitWarning`.
            {
                throw new Error('Your module system doesn\'t support emitWarning.' +
                                ' Update available? \n' + message);
            }
        }

        // If the `failOnHint` flag is enabled and issues were found,
        // throw an error to halt the compilation process.
        if (failOnHint)
        {
            throw new Error('Module failed in cause of jscs error.');
        }
    }
};


/*
 * The main Webpack loader function. This is the entry point for Webpack.
 * @param {string} source - The source code of the module being processed.
 * @returns {string|undefined} - Returns the source directly if synchronous,
 *                               otherwise undefined (handled by async callback).
 */
module.exports = function(source)
{
    // Mark the loader as cacheable. This informs Webpack that for the same
    // input and dependencies, the output will be identical, allowing caching.
    this.cacheable();

    // Attempt to get the asynchronous callback function provided by Webpack.
    // If available, the loader will operate in asynchronous mode.
    var callback = this.async();

    // If `this.async()` returns `null`, it means the loader must run synchronously.
    if (!callback)
    {
        // Load the JSCS configuration synchronously.
        var config = loadConfigSync.call(this);

        // Perform the source code check using the loaded configuration.
        checkSource.call(this, source, config);

        // Return the original source code.
        return source;
    }

    // If an asynchronous callback was provided, proceed in asynchronous mode.
    // Load the JSCS configuration asynchronously.
    loadConfigAsync.call(this, function(err, config)
    {
        // If an error occurred during configuration loading,
        // pass it to the Webpack callback to stop the build.
        if (err)
        {
            return callback(err);
        }

        try
        {
            // Attempt to check the source code with the loaded configuration.
            checkSource.call(this, source, config);
        }
        catch (e)
        {
            // If `checkSource` throws an error (e.g., due to `failOnHint`),
            // catch it and pass it to the Webpack callback.
            return callback(e);
        }

        // If all checks are successful, call the Webpack callback
        // with no error and the original source code.
        callback(null, source);

    }.bind(this)); // Ensure 'this' (the loader context) is correctly bound for the callback.
};