// This file contains core logic for a gulp plugin.
// It processes HTML/template files to handle master pages, includes, and variables.

'use strict'; // Enforce strict mode for better code quality.


var fs          = require('fs');
var path        = require('path');
var through2    = require('through2');
var gUtil       = require('gulp-util');
var PluginError = gUtil.PluginError; // Extract PluginError for convenience.
var es          = require('event-stream');
var extend      = require('node.extend');

// Load package metadata for plugin name, etc.
var pkg = require('./package.json');


// Default configuration options for the plugin.
var defaultOptions = {
    annotations: true, // Whether to add HTML comments for included/blocked content.
    verbose:     false // Enable verbose logging.
};

// A no-operation function, used when logging is disabled.
var noop = function () {};

// Internal variables to store options and the logging function.
var _options;
var log = noop;


/**
 * Main plugin function.
 * @param {object} options - Configuration options for the plugin.
 * @returns {stream.Transform} A Through2 object stream.
 */
module.exports = function (options) {

    // Merge provided options with defaults.
    _options = extend({}, defaultOptions, options || {});

    // Set up logging based on verbose option.
    if ( _options.verbose ) {
        log = gUtil.log;
    }

    // Return a transform stream that operates on vinyl files.
    return through2.obj(function (file, enc, cb) {

        // Handle null files (e.g., deleted files).
        if ( file.isNull() ) {
            return cb(null, file);
        }

        // Streaming is not supported, throw an error.
        if ( file.isStream() ) {
            return cb(new PluginError(pkg.name, 'Streaming is not supported'));
        }

        // Process buffered files.
        if ( file.isBuffer() ) {

            // Extend the file content, then call the callback.
            extendFile(file, _options, function (noMaster) {
                return cb(null, file);
            });
        }

    });

};


/**
 * Creates a Vinyl file object from a given path.
 * Supports both synchronous and asynchronous reading.
 * @param {string} absolutePath - The absolute path to the file.
 * @param {function} [cb] - Optional callback for asynchronous file reading.
 * @returns {gUtil.File|undefined} A Vinyl file object if `cb` is not provided, otherwise nothing.
 */
function makeFile(absolutePath, cb) {
    // Asynchronous file reading.
    if ( cb ) {
        fs.readFile(absolutePath, function (error, data) {
            if ( error ) {
                throw error; // Re-throw any file reading errors.
            }

            // Create a new Vinyl file instance.
            var file = new gUtil.File({
                base:     path.dirname(absolutePath),
                path:     absolutePath,
                contents: new Buffer(data), // File content as a Buffer.
            });
            cb(file); // Pass the created file to the callback.
        });
    }
    // Synchronous file reading.
    else {
        return new gUtil.File({
            base:     path.dirname(absolutePath),
            path:     absolutePath,
            contents: new Buffer(fs.readFileSync(absolutePath)), // Synchronously read content.
        });
    }
}


/**
 * Extends a Vinyl file's content based on master pages and includes.
 * This is the core logic for template processing.
 * @param {gUtil.File} file - The Vinyl file to extend.
 * @param {object} options - Plugin options.
 * @param {function} afterExtend - Callback to execute after extension is complete.
 */
function extendFile(file, options, afterExtend) {

    log('[going to extend]', file.path); // Log the file being processed.

    // First, process any @@include directives within the current file.
    interpolateIncludedContent(file, options);

    // Find if the current file specifies a master page.
    var master = findMaster(file.contents.toString('utf-8'));

    // If no master page is found, simply return.
    if ( !master ) { // No master directive found in this file.
        log('[no master]', file.path);
        afterExtend();
        return;
    }

    var masterRelativePath = master.path;

    log('[find master path]' + masterRelativePath);

    // If master path is empty or invalid, skip extension.
    if ( !masterRelativePath ) {
        afterExtend();
        return;
    }

    var masterAbsolute;
    // Determine the absolute path of the master file.
    if ( options.root && isRelativeToRoot(masterRelativePath) ) {
        // If 'root' option is provided and path is root-relative.
        masterAbsolute = path.join(process.cwd(), options.root, masterRelativePath);
    } else {
        // Otherwise, resolve relative to the current file's directory.
        masterAbsolute = path.join(path.dirname(file.path), masterRelativePath);
    }

    // Recursively extend the master file first.
    makeFile(masterAbsolute, function (masterFile) {

        extendFile(masterFile, _options, function () {

            var masterContent = masterFile.contents.toString();
            var lines         = splitByLine(masterContent);

            // Process each line of the master file.
            var newLines = lines.map(function (line, index, array) {
                // Interpolate variables defined in the master's context.
                line = interpolateVariables(line, master.context);
                var blockName = findPlaceholder(line);
                if ( blockName ) {
                    // If a placeholder is found, try to get content from the current file.
                    var blockContent = getBlockContent(file.contents.toString(), blockName);
                    return blockContent || line; // Use block content if available, else original line.
                } else {
                    return line; // Return line as is if no placeholder.
                }
            });

            var newContent = newLines.join('\n'); // Join processed lines back into a single string.

            file.contents = new Buffer(newContent); // Update the file's content buffer.

            return afterExtend(); // Call the final callback.

        });

    });

}


/**
 * Processes @@include directives within a file's content.
 * Reads included files and inserts their content.
 * @param {gUtil.File} file - The Vinyl file containing content to process.
 * @param {object} options - Plugin options.
 */
function interpolateIncludedContent(file, options) {
    var fileContent   = file.contents.toString();
    var fileLines     = splitByLine(fileContent);
    var includedLines = fileLines.map(function (line) {
        var include = findInclude(line); // Check for @@include directive.
        if ( include && include.path ) {
            var includeAbsolutePath;
            // Determine absolute path for the included file.
            if ( options.root && isRelativeToRoot(include.path) ) {
                includeAbsolutePath = path.join(process.cwd(), options.root, include.path);
            } else {
                includeAbsolutePath = path.join(path.dirname(file.path), include.path);
            }
            log('[include]', includeAbsolutePath);

            var includedFile = makeFile(includeAbsolutePath); // Get the included file.
            if ( include.context ) {
                // If context is provided, interpolate variables within the included content.
                includedFile.contents = new Buffer(interpolateVariables(
                    includedFile.contents.toString(),
                    include.context
                ));
            }
            // Recursively process includes within the included file.
            interpolateIncludedContent(includedFile, options);

            // Add annotations if enabled.
            if ( _options.annotations ) {
                return [
                    '<!-- start ' + path.basename(includeAbsolutePath) + '-->',
                    includedFile.contents.toString(),
                    '<!-- end ' + path.basename(includeAbsolutePath) + '-->'
                ].join('\n');
            } else {
                return includedFile.contents.toString(); // Return raw content without annotations.
            }
        } else {
            return line; // Return the line as is if no include directive.
        }
    });

    file.contents = new Buffer(includedLines.join('\n')); // Update the file's content.

}


/**
 * Finds and parses an @@master directive in a given string.
 * @param {string} string - The string to search.
 * @returns {object|null} An object with 'path' and 'context' if found, otherwise null.
 */
function findMaster(string) {
    var regex = /<!--\s*@@master\s*[= ]\s*(\S+)\s*(?:([^-]+)\s*)?-->/;
    var match = string.match(regex);
    return match ? {
        path:    match[1],
        context: match[2] ? JSON.parse(match[2]) : null
    } : null;
}


/**
 * Finds and parses an @@include directive in a given string.
 * @param {string} string - The string to search.
 * @returns {object|null} An object with 'path' and 'context' if found, otherwise null.
 */
function findInclude(string) {
    var regex = /<!--\s*@@include\s*[= ]\s*(\S+)\s*(?:([^-]+)\s*)?-->/;
    var match = string.match(regex);
    return match ? {
        path:    match[1],
        context: match[2] ? JSON.parse(match[2]) : null
    } : null;

}


/**
 * Finds and extracts the name from an @@placeholder directive.
 * @param {string} string - The string to search.
 * @returns {string|null} The placeholder name if found, otherwise null.
 */
function findPlaceholder(string) {
    var regex = /<!--\s*@@placeholder\s*[= ]\s*(\S+)\s*-->/;
    var match = string.match(regex);
    return match ? match[1] : null;
}


/**
 * Interpolates @@var directives in a template string with values from a context object.
 * @param {string} template - The template string.
 * @param {object} context - The context object containing variable values.
 * @returns {string} The template string with variables interpolated.
 */
function interpolateVariables(template, context) {
    if ( !context ) {
        return template; // No context, no interpolation needed.
    }
    if ( template.indexOf('@@var') < 0 ) {
        return template; // No @@var directives found, skip regex.
    }
    var regex = /<!--\s*@@var\s*[= ]\s*([^- ]+)\s*-->/;
    var match = regex.exec(template);
    while ( match ) {
        template = template.replace(match[0], context[match[1]] || ''); // Replace directive with value.
        match = regex.exec(template); // Find next match (from beginning of string).
    }
    return template;
}


/**
 * Extracts content from an @@block ... @@close directive within a string.
 * @param {string} string - The content string to search.
 * @param {string} blockName - The name of the block to find.
 * @returns {string} The content of the specified block, or an empty string if not found.
 */
function getBlockContent(string, blockName) {
    var result  = '';
    var lines   = splitByLine(string);
    var inBlock = false;
    var regex   = new RegExp('<!--\\s*@@block\\s*[= ]\\s*' + blockName + '\\s*-->');

    // Build the block content, optionally adding annotations.
    return [
        _options.annotations ? '<!-- start ' + blockName + ' -->' : '',
        lines.reduce(function (prev, current) {
            if ( inBlock ) {
                var matchEnd = /<!--\s*@@close\s*-->/.test(current);
                if ( matchEnd ) {
                    inBlock = false; // End of block.
                    return prev;
                }
                // Append current line to previous content.
                return prev + (prev === '' ? '' : '\n') + current;
            }
            var matchBegin = regex.test(current);
            if ( matchBegin ) {
                inBlock = true; // Start of block.
                return prev;
            } else {
                return prev; // Not in block and not a start tag.
            }
        }, ''), // Initial value for reduce accumulator.
        _options.annotations ? '\n<!-- end ' + blockName + ' -->' : ''
    ].join('\n');
}


/**
 * Splits a string into an array of lines, handling different line endings.
 * @param {string} string - The string to split.
 * @returns {string[]} An array of lines.
 */
function splitByLine(string) {
    return string.split(/\r\n|\n|\r/);
}


/**
 * Checks if a given path is an absolute path.
 * (Note: This function appears to be unused in the provided code, but kept for completeness.)
 * @param {string} p - The path to check.
 * @returns {boolean} True if the path is absolute, false otherwise.
 */
function inAbsolutePath(p) {
    return path.resolve(p) === path.normalize(p);
}

/**
 * Checks if a given path is relative to the root (starts with a path separator).
 * @param {string} p - The path to check.
 * @returns {boolean} True if the path is root-relative, false otherwise.
 */
function isRelativeToRoot(p) {
    return p.indexOf(path.normalize(path.sep)) === 0;
}