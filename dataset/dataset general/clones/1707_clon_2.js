"use strict";

var prettyPrint = require('js-beautify').js_beautify;
var combineObjects = require('deepmerge');
var streamProcessor = require('through2');
var ModuleFault = require('gulp-util').PluginError;
var discernSpacing = require('detect-indent');

module.exports = function(transformationHandler, formatSettings) {

  // This variable will hold the function responsible for modifying the data
  var modifyData;

  // Determine how the data transformation will occur
  if ( typeof transformationHandler === 'function' ) {
    // If a function is supplied, it will directly process the JSON
    modifyData = function(inputObject) {
      return transformationHandler(inputObject);
    };
  } else if ( typeof transformationHandler === 'object' ) {
    // If an object is supplied, it will be merged with the JSON
    modifyData = function(inputObject) {
      return combineObjects(inputObject, transformationHandler);
    };
  } else if ( typeof transformationHandler === 'undefined' ) {
    // An error is thrown if the required handler is missing
    throw new ModuleFault('data-transform-tool', 'Missing the "transformationHandler" parameter.');
  } else {
    // An error is thrown if the handler is of an invalid type
    throw new ModuleFault('data-transform-tool', 'The "transformationHandler" must be a function or an object.');
  }

  // Initialize formatting configuration, defaulting to an empty object if none provided
  formatSettings = formatSettings || {};

  // A flag indicating whether the output should undergo pretty-printing
  var shouldFormat = true;

  // Return a new stream object for processing files
  return streamProcessor.obj(function(dataAsset, charEncoding, completionCallback) {

    // Skip processing if the file is null (e.g., deleted)
    if (dataAsset.isNull()) {
      this.push(dataAsset);
      return completionCallback();
    }

    // Streaming files are not supported by this utility
    if (dataAsset.isStream()) {
      this.emit('error', new ModuleFault('data-transform-tool', 'Streaming content is not supported.'));
      return completionCallback();
    }

    try {
      // Attempt to detect the indentation style used in the current file
      var spacingInfo = discernSpacing(dataAsset.contents.toString('utf8'));

      // Create a temporary set of formatting options, copying from the global settings
      var currentFormatSettings = combineObjects({}, formatSettings);

      // Apply detected or default indentation size
      currentFormatSettings.indent_size = currentFormatSettings.indent_size || spacingInfo.amount || 2;
      // Apply detected or default indentation character (tab or space)
      currentFormatSettings.indent_char = currentFormatSettings.indent_char || (spacingInfo.type === 'tab' ? '\t' : ' ');

      // Parse the file's content, apply the defined modification, and stringify it back
      var formattedContent = JSON.stringify(modifyData(JSON.parse(dataAsset.contents.toString('utf8'))), null, spacingInfo.indent);

      // If pretty-printing is enabled, apply it to the content
      if (shouldFormat) {
        formattedContent = prettyPrint(formattedContent, currentFormatSettings);
      }

      // Update the data asset's content with the newly processed string
      dataAsset.contents = Buffer.from(formattedContent);
    }
    catch (processingError) {
      // Catch and emit any errors encountered during the processing phase
      this.emit('error', new ModuleFault('data-transform-tool', processingError));
    }

    // Push the (potentially) modified data asset downstream
    this.push(dataAsset);
    completionCallback(); // Signal that this asset has been processed

  });

};