'use strict'; // Activating strict mode for the entire script to enforce stricter parsing and error handling.


var async        = require('async');        // Core library for managing asynchronous operations.
var asyncReplace = require('async-replace'); // Utility for performing asynchronous string replacements.
var gutil        = require('gulp-util');    // Gulp utility functions, primarily used here for error handling.
var through      = require('through2');     // A transform stream module, essential for Gulp plugin development.
var cheerio      = require('cheerio');      // A server-side implementation of jQuery for HTML parsing and manipulation.
var fs           = require('fs');           // Node.js built-in file system module, used for reading files.
var path         = require('path');         // Node.js built-in path module, for handling file paths.
var url          = require('url');          // Node.js built-in URL module, for parsing and resolving URLs.


// This regular expression is designed to identify and capture entire blocks
// of content that are encapsulated between 'smoosh' and 'endsmoosh' HTML comments.
// The `[\s\S]*?` part ensures it matches any character (including newlines) non-greedily.
var replaceRegExp = /<!--\s*?smoosh\s*?-->[\s\S]*?<!--\s*?endsmoosh\s*?-->/g;


/*
 * This regular expression serves to remove the 'smoosh' and 'endsmoosh'
 * comment markers themselves from the processed HTML output.
 * It also handles any surrounding whitespace or optional newline characters
 * that might be adjacent to these markers.
 */
var removeRegExp = / *?<!--\s*?smoosh\s*?--> *\n?| *?<!--\s*?endsmoosh\s*?--> *\n?/g;


/**
 * Determines whether a given URL link points to a local resource or an external one.
 * A link is considered local if, after parsing, it does not possess a hostname.
 *
 * @param {string} link - The URL string to be evaluated.
 * @returns {boolean} - True if the link is local, false otherwise.
 */
function isLocal(link) {

	// Check if the link exists and if its parsed version lacks a hostname.
	return link
		&& ! url.parse(link).hostname
	;

}


/**
 * The main export function for the Gulp 'gulp-smoosher' plugin.
 * This function configures and returns a Gulp stream transform.
 *
 * @param {object} options - Configuration options for the plugin instance.
 * @returns {stream.Transform} A Node.js transform stream compatible with Gulp.
 */
module.exports = function(options) {

	// Initialize the HTML tags to be used for CSS content.
	// Defaults to `<style>` and `</style>` if not specified in options.
	var cssTags = options && options.cssTags
		? options.cssTags
		: {
			begin: '<style>',
			end:   '</style>'
		};

	// Initialize the HTML tags to be used for JavaScript content.
	// Defaults to `<script>` and `</script>` if not specified in options.
	var jsTags = options && options.jsTags
		? options.jsTags
		: {
			begin: '<script>',
			end:   '</script>'
		};

	// Determine the base path for resolving relative file paths.
	// If `options.base` is provided, it takes precedence; otherwise, `file.base` will be used later.
	var base = options && options.base;


	// Return a `through2` object stream, which processes each file in the Gulp pipeline.
	return through.obj(function(file, enc, callback) {

		// Handle cases where the file object contains no content (e.g., a directory).
		if (file.isNull()) {
			this.push(file); // Simply pass the null file along the stream.
			return callback(); // Signal that processing for this file is complete.
		}

		// Handle stream-based files. This plugin does not support streaming content.
		if (file.isStream()) {
			this.emit(
				'error',
				new gutil.PluginError('gulp-smoosher', 'Streaming not supported')
			); // Emit an error indicating unsupported operation.
			return callback(); // Terminate processing for this file due to error.
		}

		// Proceed with processing if the file content is provided as a Buffer.
		if (file.isBuffer()) {

			// Convert the file's buffer contents to a string for text manipulation.
			var input = String(file.contents);

			// Determine the base directory from which to read local files.
			// Prioritize the `base` option if set, otherwise use the Gulp file's own base path.
			var readFileBase = base !== undefined
				? base
				: file.base
			;

			// Perform asynchronous string replacement using the `replaceRegExp`.
			// The `replacer` function processes each matched block.
			asyncReplace(input, replaceRegExp, function replacer(match) {

				// In `asyncReplace`, the last argument to the replacer function is always the callback.
				var callback = Array.prototype.slice.call(arguments).pop();

				// Load the matched HTML block into Cheerio for jQuery-like DOM manipulation.
				var $ = cheerio.load(match);

				// Identify all `link` and `script` elements within the current HTML block.
				// Convert Cheerio collections to native arrays and then flatten them into a single array.
				var elements = [
					$('link'), // Select all <link> tags.
					$('script') // Select all <script> tags.
				].map(function toArray(elements) {
					return Array.prototype.slice.call(elements); // Convert Cheerio object to a standard JavaScript array.
				}).reduce(function flatten(a, b) {
					return a.concat(b); // Flatten the array of arrays into a single, combined array of elements.
				});

				// Iterate over each collected element asynchronously.
				// For each element, attempt to inline its content if it's a local resource.
				async.each(elements, function iterator(element, callback) {

					var $element = $(element); // Wrap the current raw DOM element with Cheerio for easy access to methods.
					var url; // Variable to store the URL (href or src) of the element.
					var tags; // Variable to store the appropriate HTML tags (<style> or <script>).

					// Check if the current element is a `<link>` tag (typically for CSS).
					if ($element.is('link')) {
						url = $element.attr('href'); // Extract the `href` attribute.
						tags = cssTags; // Use CSS specific tags for inlining.
					}

					// Otherwise, check if it's a `<script>` tag (for JavaScript).
					else if ($element.is('script')) {
						url = $element.attr('src'); // Extract the `src` attribute.
						tags = jsTags; // Use JavaScript specific tags for inlining.
					}

					// If the extracted URL points to a local resource, read its content.
					if (isLocal(url)) {
						fs.readFile(path.join(readFileBase, url), function onRead(error, data) {
							// If an error occurs during file reading, propagate it to the `async.each` callback.
							if (error) {
								return callback(error);
							}
							// Replace the original HTML element with its inlined content, wrapped in appropriate tags.
							$(element).replaceWith(tags.begin + data + tags.end);
							callback(null); // Signal successful completion for this individual element.
						});
					}
					// If the URL is not local (e.g., an external CDN link), simply skip inlining.
					else {
						callback(null); // Continue without error, as no action is needed for external resources.
					}

				}, function done(error) { // Callback executed once all elements within the block have been processed.

					// If any error occurred during the processing of elements, propagate it.
					if (error) {
						return callback(error);
					}

					// If successful, return the modified HTML of the current block to `asyncReplace`.
					// This becomes the replacement string for the matched `replaceRegExp` segment.
					callback(null, $.html());
				});

			}, function done(error, output) { // Final callback for `asyncReplace` after all blocks have been processed.

				// If any error occurred during the overall asynchronous replacement process, propagate it.
				if (error) {
					return callback(error);
				}

				// After all replacements, remove the original 'smoosh' and 'endsmoosh' comment markers.
				output = output.replace(removeRegExp, '');

				// Update the file's contents with the completely processed output.
				file.contents = new Buffer(output);

				// Push the modified file object further down the Gulp stream.
				callback(null, file);
			});
		} // End of the `if (file.isBuffer())` block.

	}); // End of `through.obj` stream definition.

}; // End of `module.exports` function.