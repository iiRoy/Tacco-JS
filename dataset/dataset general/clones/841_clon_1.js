/*
 * This file is part of a CSS module combination utility.
 *
 * @author daxingplay (daxingplay@gmail.com)
 * @license MIT
 *
 * This utility helps in processing and combining CSS modules.
 */

// Core Node.js modules for file system and path manipulation.
var fs = require('fs')

    , path = require('path')

    // Third-party utility libraries.
    , _ = require('lodash')

    , async = require('async')

    // Local utility functions.
    , utils = require('./utils');


    // Require the main CssCombo class.
var CssCombo = require('./combo');



/**
 * Internal iterator function to normalize input and prepare for batch processing.
 *
 * @param {string|object|Array<string>} src - Source file(s) or options object.
 * @param {string|Array<string>} dest - Destination file(s).
 * @param {object} options - Additional options.
 * @returns {function(function, function)} A function that takes an iterator and a callback.
 * @private
 */
function _iterator(src, dest, options) {

    var files = []
        , dests = [];


    // Ensure options is a plain object; clone if it is, otherwise initialize.
    options = _.isPlainObject(options)
        ? _.clone(options)
        : {};


    // Handle different input formats for src/dest.
    if (src && _.isPlainObject(src)) {
        // If src is an options object, extract files and dests from it.
        options = src;
        files.push(options.src || options.target);
        dests.push(options.dest || options.output);
    } else if (_.isString(src)) {
        // If src is a string, treat it as a single file.
        files.push(src);
        dests.push(dest);
    } else {
        // Otherwise, assume src and dest are arrays of files/dests.
        files = src;
        dests = dest;
    }

    // Return a function that will execute the actual iteration.
    return function (iterator, callback) {

        var funcs = []; // Array to hold functions for async parallel execution.


        _.forEach(files, function (file, index) {

            // For each file, create a function that will be executed in parallel.
            funcs.push(function (cb) {

                // Call the provided iterator with normalized item data.
                iterator({
                    src: file,
                    dest: _.isArray(dests)
                        ? (dests[index] || '') // Use specific dest if array, otherwise empty string.
                        : dests,               // Use single dest if not an array.
                    options: options
                }, cb); // Pass the callback to the iterator.
            });
        });


        // Execute all collected functions in parallel.
        async.parallel(funcs, function (err, results) {

            // Invoke the final callback once all parallel tasks are complete.
            callback && callback(err, results);
        });
    };
}


// Exported public API for the module.
module.exports = {

    /**
     * Builds CSS modules.
     *
     * @param {string|object|Array<string>} src - Source file(s) or options object.
     * @param {string|Array<string>} dest - Destination file(s).
     * @param {object} options - Additional build options.
     * @param {function} callback - Callback function.
     */
    build: function (src, dest, options, callback) {

        // Handle flexible arguments: options and callback can be omitted.
        for (var i = 1; i < arguments.length; i++) {

            if (_.isFunction(arguments[i])) {
                callback = arguments[i];
                break;
            }
        }

        // Initialize the iterator with the provided source, destination, and options.
        var walker = _iterator(src, dest, options);

        // Execute the walk with a custom function for each item.
        walker(function (item, cb) {

            // Merge item-specific options with global options.
            var c = _.merge(item.options, {
                src: item.src,
                dest: item.dest
            });

            // Create a new CssCombo instance and build it.
            new CssCombo(c).build(cb);
        }, callback); // Pass the final callback to the walker.
    },


    /**
     * Analyzes CSS modules.
     *
     * @param {string|object|Array<string>} src - Source file(s) or options object.
     * @param {object} options - Additional analysis options.
     * @param {function} callback - Callback function.
     */
    analyze: function (src, options, callback) {

        // Handle flexible arguments: options and callback can be omitted.
        for (var i = 1; i < arguments.length; i++) {

            if (_.isFunction(arguments[i])) {
                callback = arguments[i];
                break;
            }
        }

        // Initialize the iterator for analysis (destination is not relevant here).
        var walker = _iterator(src, '', options);

        // Execute the walk with a custom function for each item to analyze.
        walker(function (item, cb) {

            // Merge item-specific options with global options for analysis.
            var c = _.merge(item.options, {
                src: item.src,
                dest: item.dest // dest might be an empty string, but keep for consistency.
            });

            // Create a new CssCombo instance and analyze it.
            new CssCombo(c).analyze(cb);
        }, callback); // Pass the final callback to the walker.
    },


    // Expose the version from package.json.
    version: require('../package.json').version
};