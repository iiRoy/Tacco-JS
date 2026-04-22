'use strict';

// --- Core Module Requirements ---
// This module facilitates a stream-based transformation for CSS assets.
// It relies on several external libraries for managing the data pipeline,
// providing utility functions, performing the actual CSS processing,
// and embedding source map information into the output files.
const dataFlowConduit = require('through2'); // Stream processing utility for object streams
const pluginHelpers = require('gulp-util'); // Collection of Gulp-specific utility functions
const styleTransformEngine = require('pleeease'); // The primary engine for CSS manipulation and optimization
const sourceMapEmbedder = require('vinyl-sourcemaps-apply'); // Tool to apply generated source maps to Vinyl file objects

// --- Plugin-Specific Constants ---
// Defines a set of default configuration parameters for the CSS transformation.
// These defaults ensure a baseline behavior but can be overridden by user input.
const BASELINE_TRANSFORM_CONFIG = {
  autoprefixer: {
    cascade: true, // Maintain CSS cascade structure where possible
    remove: true   // Remove old prefixes not needed by target browsers
  },
  minify: false,   // Default to no minification
  comments: 'all', // Preserve all comments by default
  sass: false,     // No Sass compilation by default
  less: false      // No Less compilation by default
};

// A unique identifier for this Gulp plugin, used in error messages and logs.
const PLUGIN_NAME_TAG = 'gulp-css-sculptor';

/**
 * Generates a Gulp plugin stream that processes CSS files through a style transformation engine.
 * This function acts as the entry point for configuring and initiating the CSS processing pipeline.
 *
 * @param {object} [userConfigOverrides] - An optional object containing configuration options
 *                                        to customize the style transformation process.
 *                                        These options will override the default settings.
 * @returns {object} A `through2` object stream that accepts Vinyl file objects, transforms their
 *                   CSS content, and emits the modified files.
 */
module.exports = function (userConfigOverrides) {
  // Validate and normalize the user-provided configuration.
  // If `userConfigOverrides` is not a valid object, an empty object is used to prevent errors
  // during the merging process.
  const providedCustomConfig = (typeof userConfigOverrides === 'object' && userConfigOverrides !== null)
    ? userConfigOverrides
    : {};

  // Create the final, effective configuration by merging the baseline defaults
  // with the user-provided overrides. User settings take precedence.
  const activeTransformationSettings = { ...BASELINE_TRANSFORM_CONFIG, ...providedCustomConfig };

  /**
   * Internal utility function to standardize the creation of Gulp plugin errors.
   * This ensures consistent error reporting across the plugin.
   *
   * @param {string} issueDescription - A human-readable message describing the error.
   * @param {Error|*} [originalCause] - The underlying error object that triggered this issue, if any.
   * @param {string} [affectedResourcePath] - The path of the file or resource that caused the error.
   * @returns {pluginHelpers.PluginError} A Gulp-specific `PluginError` instance.
   */
  const constructPluginError = (issueDescription, originalCause, affectedResourcePath) => {
    return new pluginHelpers.PluginError(PLUGIN_NAME_TAG, issueDescription, {
      fileName: affectedResourcePath,
      showStack: true, // Include stack trace for debugging
      err: originalCause // Attach the original error for deeper inspection
    });
  };

  // Initialize and return the `through2` object stream.
  // This stream's transform function will be called for each file passing through.
  return dataFlowConduit.obj(function (assetPayload, encodingScheme, completionCallback) {
    // --- Initial Asset Validation and Filtering ---

    // Scenario 1: Null file (e.g., file deleted upstream). Pass it along without processing.
    if (assetPayload.isNull()) {
      completionCallback(null, assetPayload);
      return;
    }

    // Scenario 2: File content is a stream. This plugin requires buffered content
    // for comprehensive CSS processing, so streaming is explicitly not supported.
    if (assetPayload.isStream()) {
      const streamingIssue = constructPluginError(
        'Streaming content is not supported by this CSS transformation plugin.',
        null,
        assetPayload.path
      );
      completionCallback(streamingIssue);
      return;
    }

    // Scenario 3: File has no content (empty buffer). Log a warning and skip processing.
    if (!assetPayload.contents || assetPayload.contents.length === 0) {
      pluginHelpers.log(
        pluginHelpers.colors.yellow(`[${PLUGIN_NAME_TAG}] Warning: Asset "${assetPayload.path}" has no content. Skipping transformation.`)
      );
      completionCallback(null, assetPayload);
      return;
    }

    // --- Main CSS Transformation Process ---
    try {
      // Create a mutable copy of the active settings for this specific file's processing.
      // This is crucial to avoid unintended side effects on the global configuration object.
      let currentFileSettings = { ...activeTransformationSettings };

      // If the input asset has a source map, configure the transformation engine
      // to generate an updated source map as part of the output.
      if (assetPayload.sourceMap) {
        currentFileSettings.sourcemaps = {
          from: assetPayload.relative || assetPayload.path, // Original source path for map generation
          to: assetPayload.relative,                       // Relative output path for the map
          map: {
            annotation: false // Prevent adding `sourceMappingURL` comment to the CSS output
          }
        };
      }

      // Convert the asset's buffer content into a string, as the style engine expects string input.
      const incomingCssString = String(assetPayload.contents);

      // Execute the core CSS transformation using the configured style engine.
      // The result can be either a string (processed CSS) or an object
      // `{css: string, map: object}` if sourcemaps were enabled.
      const transformationOutcome = styleTransformEngine.process(incomingCssString, currentFileSettings);

      // --- Update Asset Payload with Transformed Content ---

      // Extract the final CSS string from the transformation outcome.
      // If `transformationOutcome` is an object, `transformationOutcome.css` holds the CSS.
      // Otherwise, `transformationOutcome` itself is the CSS string.
      const finalTransformedCss = (typeof transformationOutcome === 'object' && transformationOutcome.css)
        ? transformationOutcome.css
        : transformationOutcome;

      // Update the Vinyl file's content buffer with the newly processed CSS.
      // Using `Buffer.from()` for modern Node.js compatibility.
      assetPayload.contents = Buffer.from(finalTransformedCss);

      // --- Source Map Integration ---

      // If a source map was generated by the transformation engine and the original asset
      // also had a source map, apply the new source map to the asset payload.
      if (assetPayload.sourceMap && transformationOutcome.map) {
        // Ensure the source map content is converted to a string before embedding.
        sourceMapEmbedder(assetPayload, transformationOutcome.map.toString());
      }

      // Signal successful processing and pass the modified asset down the stream.
      completionCallback(null, assetPayload);

    } catch (operationIssue) {
      // --- Error Handling for Transformation Failures ---

      // Construct a comprehensive error object detailing the failure.
      const processingFailure = constructPluginError(
        `An error occurred during CSS transformation: ${operationIssue.message}`,
        operationIssue,
        assetPayload.path
      );

      // Invoke the stream's callback with the error, halting further processing for this file.
      completionCallback(processingFailure);

      // Additionally, emit an 'error' event on the stream itself. This is a standard
      // Gulp plugin practice to allow error listeners to catch and handle issues.
      this.emit('error', processingFailure);
    }
  }); // End of dataFlowConduit.obj() stream definition
}; // End of module.exports function