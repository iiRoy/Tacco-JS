var util = require('util'); // Core utility module
var fs = require('fs'); // File system module for file operations
var path = require('path'); // Path module for handling file paths

// Internal modules for mu
var Stream = require('./mu/stream');
var parser = require('./mu/parser');
var renderer = require('./mu/renderer');
var errors = require('./mu/errors'); // Not used in this version, but kept for consistency


// The main `mu` object, which is also the module's export.
var mu = module.exports = {};

// Sets the root directory for relative path resolution.
mu.root = process.cwd();

// Cache for compiled templates.
mu.cache = {};


/**
 * @function mu.fs
 * @description Reads a file from the file system.
 * @param {string} filename - The path to the file. Can be absolute or relative to mu.root.
 * @param {Function} callback - Callback function (err, contents).
 */
mu.fs = function(filename, callback) {

    // Determine if the filename is absolute or relative
    filename = filename.indexOf('/') === 0 || filename.indexOf(':\\') === 1
        ? filename // Absolute path
        : path.join(mu.root, filename); // Relative path, join with root

    // Read the file asynchronously
    fs.readFile(filename, 'utf8', callback);

}; // End of mu.fs function


// This function compiles a template file and stores it in the cache.
mu.compile = function(filename, callback, unique) {

    var parsed;
    // Initialize unique if not provided.
    var unique = unique || {};

    // Read the template file using the internal fs function.
    mu.fs(filename, function(err, contents) {
        // If an error occurs during file reading, propagate it.
        if (err) {
            return callback(err);
        }

        // Parse the template contents into a structured representation.
        parsed = parser.parse(contents);

        // Store the parsed template and unique identifier in the cache.
        mu.cache[filename] = [parsed, unique];

        var i = 0; // Initialize counter for partials.

        // Define a self-invoking recursive function to compile partials.
        (function next(err) {
            // If an error occurred in a partial compilation, stop and return.
            if (err) {
                return callback(err);
            }

            // Check if there are more partials to compile.
            if (i < parsed.partials.length) {
                // Recursively call mu.compile for the next partial.
                mu.compile(parsed.partials[i], next, unique);
                i++; // Increment the partials counter.
            } else {
                // All partials compiled, call the main callback with the parsed template.
                callback(undefined, [parsed, {}]);
            }
        }()); // Execute the next function immediately.
    });
}; // End of mu.compile function


/*
 * Compiles a raw string template.
 * If a name is provided, the compiled template will be cached under that name.
 * Otherwise, the parsed template object is returned directly.
 * An optional callback can be used to unify the API with mu.compile.
 */
mu.compileText = function(name, template, callback) {

    var parsed; // Variable to hold the parsed template.

    // Handle optional 'name' argument: if only two arguments,
    // the first is template and name is undefined.
    if (typeof template === 'undefined') {
        template = name;
        name = undefined;
    }

    try {
        // Parse the template string.
        parsed = parser.parse(template);

        // If a name was provided, cache the parsed template.
        if (name) {
            mu.cache[name] = [parsed, {}];
        }

        // If a callback is provided, invoke it; otherwise, return the parsed object.
        if (callback) {
            callback(undefined, parsed);
        } else {
            return parsed;
        }

    } catch (err) {
        // If parsing fails, handle the error.
        if (callback) {
            callback(err); // Pass error to callback if available.
        } else {
            throw err; // Re-throw error if no callback.
        }
    }
}; // End of mu.compileText function


/*
 * Renders a template.
 * The template can be specified either by its filename (if cached) or by a pre-parsed object.
 *
 * @param {string|object} filenameOrParsed - The name of a cached template or a parsed template object.
 * @param {object} view - The data context for rendering.
 * @returns {Stream} - A stream that emits the rendered output.
 * @throws {Error} - If the template is not found in the cache.
 */
mu.render = function(filenameOrParsed, view) {

    var stream; // Placeholder for the stream (not used directly here, but conceptually part of rendering pipeline).

    // Determine if filenameOrParsed is an object (already parsed) or a string (cache key).
    var parsed = typeof filenameOrParsed === 'object'
        ? filenameOrParsed // Already a parsed object.
        : mu.cache[filenameOrParsed]; // Retrieve from cache using filename as key.

    // Proceed if a parsed template was found or provided.
    if (parsed) {
        // If `parsed` is an array (from cache, e.g., [parsed_obj, unique_obj]), extract the parsed object.
        parsed = parsed[0] || parsed;

        // Begin the rendering process and return the resulting stream.
        return beginRender(parsed.tokens, view, mu.cache);
    } else {
        // If the template was not found in the cache, throw an error.
        throw new Error('template_not_in_cache');
    }
}; // End of mu.render function


// Renders a template string directly, without caching it by name.
mu.renderText = function(template, view, partials) {

    var name, parsed, tokens, stream; // Declare local variables.

    partials = partials || {}; // Ensure partials object exists.

    // Create a shallow copy of partials to avoid modifying the original.
    partials = shallowCopy(partials);

    // Set the prototype of the partials object to mu.cache for fallback lookups.
    partials.__proto__ = mu.cache;

    // Iterate through provided partials to ensure they are parsed if not already.
    for (name in partials) {
        // Check if the partial is a direct property and not yet parsed.
        if (partials.hasOwnProperty(name) && !partials[name].tokens) {
            partials[name] = parser.parse(partials[name]); // Parse the partial string.
        }
    }

    // Parse the main template string.
    parsed = parser.parse(template);

    // Extract tokens from the parsed template.
    tokens = parsed.tokens;

    // Start the rendering process with the parsed tokens, view data, and partials.
    return beginRender(tokens, view, partials);
}; // End of mu.renderText function


/*
 * Clears the internal template cache.
 * If a templateName is provided, only that specific template is removed.
 * If no templateName is given, the entire cache is cleared.
 *
 * @param {string} [templateName] - The name of the template to remove from cache.
 */
mu.clearCache = function(templateName) {

    // Check if a specific template name was provided.
    if (templateName) {
        // Delete only the specified template from the cache.
        delete mu.cache[templateName];
    } else {
        // If no name, clear the entire cache by reassigning an empty object.
        mu.cache = {};
    }
}; // End of mu.clearCache function


/*
 * This function compiles a template (if not already cached) and then renders it.
 * It's a convenience method that combines compilation and rendering.
 *
 * @param {string} templateName - The identifier for the template to be compiled and rendered.
 * @param {object} view - The data context object to be used during rendering.
 * @returns {Stream} - A stream that will output the rendered content.
 */
mu.compileAndRender = function(templateName, view) {

    var stream = new Stream(); // Create a new stream for the output.
    var parsed = mu.cache[templateName]; // Attempt to retrieve the template from cache.

    // Check if the template is already in the cache.
    if (parsed) {
        // If cached, immediately start rendering with the cached data.
        beginRenderWithStream(parsed[0].tokens, view, mu.cache, stream);
    } else {
        // If not cached, compile the template first.
        mu.compile(templateName, function(err, parsed) {
            // Handle any compilation errors.
            if (err) return stream.emit('error', err);

            // Once compiled, begin rendering using the newly parsed template.
            beginRenderWithStream(parsed[0].tokens, view, mu.cache, stream);
        });
    }

    return stream; // Return the stream immediately.
}; // End of mu.compileAndRender function


// --- Private API Functions ---
// These functions are internal helpers and not exposed directly on the `mu` object.

// Defines the buffer length for internal operations, typically for streaming.
var BUFFER_LENGTH = 1024 * 8; // 8KB buffer.


/**
 * Initiates the rendering process for a given set of tokens.
 * Creates a new stream and passes it to `beginRenderWithStream`.
 * @param {Array} tokens - The parsed tokens of the template.
 * @param {object} view - The data context for rendering.
 * @param {object} partials - An object containing partial templates.
 * @returns {Stream} - The rendering stream.
 */
function beginRender(tokens, view, partials) {

    var stream = new Stream(); // Create a new rendering stream.

    // Delegate to the stream-aware rendering function.
    beginRenderWithStream(tokens, view, partials, stream);

    return stream; // Return the stream to the caller.
}


/**
 * Core function to start the rendering process, emitting output to a provided stream.
 * Schedules the actual rendering to happen on the next tick of the event loop.
 * This prevents blocking and allows for asynchronous error handling.
 * @param {Array} tokens - The parsed tokens of the template.
 * @param {object} view - The data context.
 * @param {object} partials - Partial templates available for inclusion.
 * @param {Stream} stream - The stream to write rendered output to.
 */
function beginRenderWithStream(tokens, view, partials, stream) {

    var count = 0; // This variable is declared but not used in the provided snippet.

    // Schedule the rendering task to run on the next event loop tick.
    process.nextTick(function() {
        try {
            // Call the renderer to perform the actual rendering.
            // The callback is invoked when rendering is complete.
            renderer.render(tokens, view, partials, stream, function() {
                stream.emit('end'); // Signal the end of the stream.
            });
        } catch (err) {
            // Catch synchronous errors during rendering and emit them on the stream.
            stream.emit('error', err);
        }
    });
}


/**
 * Creates a shallow copy of an object.
 * Only copies own enumerable properties.
 *
 * @param {object} obj - The object to copy.
 * @returns {object} - A new object with the copied properties.
 */
function shallowCopy(obj) {

    var o = {}; // Initialize an empty object for the copy.

    // Iterate over the properties of the input object.
    for (var key in obj) {
        // Check if the property is an own property (not inherited).
        if (obj.hasOwnProperty(key)) {
            o[key] = obj[key]; // Copy the property value.
        }
    }

    return o; // Return the new object.
}