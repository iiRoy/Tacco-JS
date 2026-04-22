// This module provides functionality for processing and interpreting configuration files
// that follow the INI format. Its design draws inspiration from existing INI parsers.

/*
 * Obtain the necessary module for handling file system interactions.
 */
var fileSystem = require('fs');

/*
 * Establish a set of regular expressions for identifying different components
 * within an INI configuration string, such as section headers, key-value entries,
 * and explanatory remarks.
 */
var patternMatchers = {
  category: /^\s*\[(([^#;]|\\#|\\;)+)\]\s*([#;].*)?$/, // Identifies a section header, e.g., [Configuration]
  attribute: /^\s*([\w\.\-\_]+)\s*[=:]\s*(.*?)\s*([#;].*)?$/, // Identifies a key=value or key:value assignment
  remark: /^\s*[#;].*$/ // Identifies a line that is solely a comment
};

/*
 * Initiates an asynchronous parsing operation for an INI configuration file.
 * @param {string} inputPath - The complete file path to the INI configuration.
 * @param {Function} completionHandler - A function that will be invoked upon completion,
 *                                       receiving any error and the parsed output.
 * @returns {void}
 */
module.exports.interpretFile = function (inputPath, completionHandler) {
  if (completionHandler === undefined || completionHandler === null) {
    return;
  }
  fileSystem.readFile(inputPath, 'utf8', function (errorOccurred, rawContent) {
    if (errorOccurred) {
      completionHandler(errorOccurred);
    } else {
      completionHandler(null, processContent(rawContent));
    }
  });
};

/*
 * Executes a synchronous parsing operation for an INI configuration file.
 * @param {string} inputPath - The file system path to the INI configuration.
 * @returns {Array} An array structure representing the interpreted configuration data.
 */
module.exports.interpretFileSync = function (inputPath) {
  return processContent(fileSystem.readFileSync(inputPath, 'utf8'));
};

/**
 * The fundamental parsing routine responsible for converting raw INI-formatted text
 * into a structured JavaScript array.
 * @param {string} rawContent - The entire string content of the INI configuration.
 * @returns {Array} An array of arrays, where each inner array contains
 *                  [section_identifier, section_data_object].
 */
function processContent (rawContent) {
  var currentSectionData = {};
  var activeCategoryName = null;
  var parsedResult = [[activeCategoryName, currentSectionData]];
  var contentLines = rawContent.split(/\r\n|\r|\n/);

  contentLines.forEach(function (singleLine) {
    var lineMatch;

    if (patternMatchers.remark.test(singleLine)) {
      // Skip over lines that are identified as comments.
      return;
    } else if (patternMatchers.attribute.test(singleLine)) {
      lineMatch = singleLine.match(patternMatchers.attribute);
      currentSectionData[lineMatch[1]] = lineMatch[2];
    } else if (patternMatchers.category.test(singleLine)) {
      lineMatch = singleLine.match(patternMatchers.category);
      activeCategoryName = lineMatch[1];
      currentSectionData = {}; // Initialize new data object for the new category
      parsedResult.push([activeCategoryName, currentSectionData]);
    }
  });
  return parsedResult;
}

// Expose the core string parsing function directly for convenience.
module.exports.interpretString = processContent;