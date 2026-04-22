'use strict';

const flowUtils        = require('async');       // Utility for managing asynchronous flow
const textProcessor    = require('async-replace'); // Handles asynchronous string replacements
const pipeTools        = require('gulp-util');   // Gulp-specific utilities for stream operations
const streamTransformer = require('through2');    // Creates writable/readable streams
const domParser        = require('cheerio');     // Fast, flexible, and lean implementation of core jQuery for the server
const fileSystem       = require('fs');          // Node.js file system module
const pathResolver     = require('path');        // Node.js path module
const webAddress       = require('url');         // Node.js URL parsing module

// Pattern to locate content blocks enclosed by specific HTML comments.
// It captures everything between '<!-- smoosh -->' and '<!-- endsmoosh -->', including the comments themselves.
const blockSearchPattern = /<!--\s*?smoosh\s*?-->[\s\S]*?<!--\s*?endsmoosh\s*?-->/g;

// Pattern to remove the opening and closing 'smoosh' comment tags after processing.
// This ensures they don't appear in the final output.
const tagCleanupPattern = / *?<!--\s*?smoosh\s*?--> *\n?| *?<!--\s*?endsmoosh\s*?--> *\n?/g;

/**
 * Determines if a given URL string refers to a local resource.
 * Checks if the URL has no hostname, implying it's a relative path or local file.
 * @param {string | null | undefined} resourceLink - The URL string to check.
 * @returns {boolean} - True if the link is local, false otherwise.
 */
function isInternalResource(resourceLink) {
    if (!resourceLink || typeof resourceLink !== 'string') {
        return false; // Invalid or missing link is not local.
    }
    try {
        const parsedUrl = webAddress.parse(resourceLink);
        // A local resource typically doesn't have a hostname.
        return !parsedUrl.hostname;
    } catch (parseError) {
        // If URL parsing fails, assume it's not a valid external URL, potentially local.
        // Or, more safely, treat as non-local if it can't be parsed reliably.
        // For this clone, we'll maintain original behavior of `!hostname`.
        return false;
    }
}

/**
 * Creates a Gulp plugin stream that processes HTML files to inline local CSS and JS resources.
 * Resources within '<!-- smoosh -->' blocks are read from disk and embedded directly.
 * @param {object} [transformationSettings={}] - Configuration options for the plugin.
 * @param {object} [transformationSettings.cssBlockWrappers={begin: '<style>', end: '</style>'}] - Tags for inlining CSS.
 * @param {object} [transformationSettings.jsBlockWrappers={begin: '<script>', end: '</script>'}] - Tags for inlining JavaScript.
 * @param {string} [transformationSettings.sourceBasePath] - Optional base directory for resolving local resource paths.
 * @returns {stream.Duplex} A `through2` stream for Gulp.
 */
module.exports = function(transformationSettings = {}) {

    // Define default tag wrappers for CSS and JS content.
    const defaultCssWrappers = { begin: '<style>', end: '</style>' };
    const defaultJsWrappers = { begin: '<script>', end: '</script>' };

    // Extract and set up configuration with defaults.
    const {
        cssBlockWrappers = defaultCssWrappers,
        jsBlockWrappers = defaultJsWrappers,
        sourceBasePath
    } = transformationSettings;

    // Helper to create Gulp PluginErrors consistently.
    const createPluginError = (message) => new pipeTools.PluginError('gulp-code-smoosher', message);

    // Construct the stream object.
    return streamTransformer.obj(function(dataChunk, encoding, completionHandler) {

        // Handle empty files: push and continue.
        if (dataChunk.isNull()) {
            this.push(dataChunk);
            return completionHandler();
        }

        // Streaming is not supported due to the nature of DOM manipulation and file reading.
        if (dataChunk.isStream()) {
            this.emit('error', createPluginError('Streaming is not supported for this operation.'));
            return completionHandler();
        }

        // Process file buffers.
        if (dataChunk.isBuffer()) {

            const contentString = String(dataChunk.contents); // Convert buffer to string.

            // Determine the base path for resolving local files.
            // If `sourceBasePath` is provided in settings, use it; otherwise, use the file's own base.
            const effectiveBasePath = sourceBasePath !== undefined ? sourceBasePath : dataChunk.base;

            // Perform asynchronous replacements on identified blocks.
            // The `blockSearchPattern` finds the blocks, and `blockProcessor` handles each match.
            textProcessor(contentString, blockSearchPattern, function blockProcessor(matchedBlockContent, ...args) {

                // The last argument to `async-replace`'s replacer function is always its own callback.
                const finishBlockProcessing = args.pop();

                // Load the HTML fragment into cheerio for DOM manipulation.
                const domManipulator = domParser.load(matchedBlockContent);

                // Collect all <link> and <script> elements within the current matched block.
                // We need to convert Cheerio collections to standard arrays for `async.each`.
                const processableElements = [
                    ...Array.from(domManipulator('link')),
                    ...Array.from(domManipulator('script'))
                ];

                // Iterate over each collected element asynchronously to process its content.
                flowUtils.each(processableElements, function processSingleElement(currentElementNode, elementCompletion) {

                    const currentDomNode = domManipulator(currentElementNode);
                    let resourcePath;
                    let wrapperTags; // Stores {begin, end} tags for replacement.

                    // Determine if the element is a CSS link or a JavaScript script.
                    // This uses Cheerio's internal tagName property (available on the raw element).
                    const nodeTagName = currentDomNode[0].tagName;

                    if (nodeTagName === 'link') {
                        resourcePath = currentDomNode.attr('href');
                        wrapperTags = cssBlockWrappers;
                    } else if (nodeTagName === 'script') {
                        resourcePath = currentDomNode.attr('src');
                        wrapperTags = jsBlockWrappers;
                    } else {
                        // If it's neither, it's an unrecognized element; skip it.
                        return elementCompletion(null);
                    }

                    // Check if the resource is local and needs to be inlined.
                    if (isInternalResource(resourcePath)) {
                        const fullResourcePath = pathResolver.join(effectiveBasePath, resourcePath);

                        // Read the local file content.
                        fileSystem.readFile(fullResourcePath, function fileReadCallback(readError, fileContentBuffer) {
                            if (readError) {
                                // Propagate the error if file reading fails.
                                pipeTools.log(pipeTools.colors.red(`Error reading file: ${fullResourcePath} - ${readError.message}`));
                                return elementCompletion(readError);
                            }

                            // Ensure content is a string for embedding.
                            const fileContent = fileContentBuffer ? fileContentBuffer.toString('utf8') : '';

                            // Replace the original HTML element with its inlined content.
                            // e.g., `<link href="style.css">` becomes `<style>/* content */</style>`.
                            currentDomNode.replaceWith(`${wrapperTags.begin}${fileContent}${wrapperTags.end}`);
                            elementCompletion(null); // Mark this element as processed successfully.
                        });
                    } else {
                        // External resources are not processed; simply move to the next element.
                        elementCompletion(null);
                    }

                }, function blockProcessingDone(processingError) { // Callback for `flowUtils.each`
                    if (processingError) {
                        // If any element processing failed, report it.
                        pipeTools.log(pipeTools.colors.red('Error during block element processing.'), processingError.message);
                        return finishBlockProcessing(processingError);
                    }
                    // Return the modified HTML content of the block for `async-replace`.
                    finishBlockProcessing(null, domManipulator.html());
                });

            }, function globalReplacementComplete(overallError, finalTransformedOutput) { // Callback for `textProcessor`

                if (overallError) {
                    // If an error occurred during any block replacement, emit it.
                    pipeTools.log(pipeTools.colors.red('Overall error during HTML content transformation.'), overallError.message);
                    this.emit('error', createPluginError(`Transformation failed: ${overallError.message}`));
                    return completionHandler(overallError);
                }

                // Remove the 'smoosh' comment tags themselves from the final output.
                const cleanedOutput = finalTransformedOutput.replace(tagCleanupPattern, '');

                // Update the file's contents with the processed HTML.
                dataChunk.contents = Buffer.from(cleanedOutput, 'utf8');

                // Push the modified file downstream in the Gulp pipeline.
                this.push(dataChunk);
                completionHandler(null); // Signal completion for this file.
            });
        }
    });
};