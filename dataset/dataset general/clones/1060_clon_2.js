'use strict';

var flowControl        = require('async');
var deferredSubstitution = require('async-replace');
var utilityBelt        = require('gulp-util');
var streamProcessor      = require('through2');
var domManipulator      = require('cheerio');
var diskOps           = require('fs');
var routeHandler         = require('path');
var webAddress           = require('url');

// This regular expression identifies and captures content
// situated between designated start and end markers for replacement.
var blockContentPattern = /<!--\s*?smoosh\s*?-->[\s\S]*?<!--\s*?endsmoosh\s*?-->/g;

// This pattern is used to eliminate the special start and end markers
// after content processing.
var tagRemovalPattern = / *?<!--\s*?smoosh\s*?--> *\n?| *?<!--\s*?endsmoosh\s*?--> *\n?/g;

function isRelativePath(resourcePath) {
	return resourcePath && ! webAddress.parse(resourcePath).hostname;
}

module.exports = function(configSettings) {

	var styleMarkers = configSettings && configSettings.cssTags ? configSettings.cssTags : {start: '<style>', stop: '</style>'};
	var scriptMarkers = configSettings && configSettings.jsTags ? configSettings.jsTags : {start: '<script>', stop: '</script>'};
	var rootDirectory = configSettings && configSettings.base;

	// Establish a transform stream where each incoming file object will be processed.
	return streamProcessor.obj(function(processedFile, encoding, completionHandler) {

		// If the file has no content, pass it through without modification.
		if (processedFile.isNull()) {
			this.push(processedFile);
			return completionHandler();
		}

		// Streaming files are not supported by this plugin.
		if (processedFile.isStream()) {
			this.emit('error', new utilityBelt.PluginError('file-bundler', 'Streaming input is not supported'));
			return completionHandler();
		}

		// If the file content is provided as a buffer, proceed with processing.
		if (processedFile.isBuffer()) {

			var sourceContent = String(processedFile.contents);

			var readBaseFolder = rootDirectory !== undefined ? rootDirectory : processedFile.base;

			deferredSubstitution(sourceContent, blockContentPattern, function contentReplacer(blockSegment) {

				// The final argument of deferredSubstitution is always the continuation callback.
				var segmentDoneCallback = Array.prototype.slice.call(arguments).pop();

				var domEditor = domManipulator.load(blockSegment);

				// Convert all relevant DOM elements (links and scripts) into a flat array
				// to facilitate asynchronous iteration.
				var targetElements = [domEditor('link'), domEditor('script')].map(function convertToArray(domCollection) {
					return Array.prototype.slice.call(domCollection);
				}).reduce(function combineArrays(accumulator, currentArray) {
					return accumulator.concat(currentArray);
				});

				// Process each identified element within this specific comment block asynchronously.
				flowControl.each(targetElements, function elementProcessor(currentElement, elementCompleted) {

					var domElement = domEditor(currentElement);
					var resourceIdentifier, formatTags;

					if (domElement.is('link')) {
						resourceIdentifier = domElement.attr('href');
						formatTags = styleMarkers;
					} else if (domElement.is('script')) {
						resourceIdentifier = domElement.attr('src');
						formatTags = scriptMarkers;
					}

					// If the resource path is local, read its content from disk.
					if (isRelativePath(resourceIdentifier)) {
						diskOps.readFile(routeHandler.join(readBaseFolder, resourceIdentifier), function fileReadHandler(readError, fileData) {
							if (readError) {
								return elementCompleted(readError);
							}
							// Replace the original element with its inlined content, wrapped in appropriate tags.
							domEditor(currentElement).replaceWith(formatTags.start + fileData + formatTags.stop);
							elementCompleted(null);
						});
					} else {
						// External resources are left untouched.
						elementCompleted(null);
					}

				}, function blockProcessingComplete(blockError) {

					if (blockError) {
						return segmentDoneCallback(blockError);
					}
					// Provide the modified HTML content back to deferredSubstitution.
					segmentDoneCallback(null, domEditor.html());
				});

			}, function overallCompletion(overallError, finalOutput) {

				if (overallError) {
					return completionHandler(overallError);
				}

				// Remove the original smoosh markers from the final processed output.
				finalOutput = finalOutput.replace(tagRemovalPattern, '');

				// Update the file buffer with the new content.
				processedFile.contents = Buffer.from(finalOutput);

				// Signal completion and pass the modified file down the stream.
				completionHandler(null, processedFile);
			});
		}

	});
};