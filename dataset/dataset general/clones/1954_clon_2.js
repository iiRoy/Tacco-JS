'use strict';

/*
 * Module dependencies and external tools.
 * We bring in the 'colors' library for console output styling,
 * and our internal 'utilities' module for helper functions.
 */
require('colors');
var UtilitiesModule = require('./utils');

// Expose the current application version, sourced from package metadata.
exports.toolVersion = require('../package.json').version;

/**
 * Transforms an input data structure into a formatted string representation.
 * This function recursively processes various data types to create a human-readable output,
 * often used for debugging or displaying JSON-like structures in the console.
 *
 * @param {any} inputData - The data to be formatted and displayed.
 * @param {object} configSettings - Configuration options for the rendering process.
 * @param {number} baseSpacing - The initial indentation level for the current processing step.
 *
 * Example configuration object:
 *
 *     {
 *       emptyArrMessage: '(empty list)', // Text displayed for empty arrays
 *       keyHue: 'cyan',                  // Color for property keys in objects
 *       bulletHue: 'magenta',            // Color for array item bullets
 *       strHue: 'yellow',                // Color for string values
 *       defaultSpacing: 3                // Default indentation increment for nested structures
 *     }
 */
exports.displayStructure = function processDataForDisplay(
  inputData,
  configSettings,
  baseSpacing
) {
  // Establish default values for parameters and configuration.
  baseSpacing = baseSpacing || 0;
  configSettings = configSettings || {};
  configSettings.emptyArrMessage = configSettings.emptyArrMessage || '(empty list)';
  configSettings.keyHue = configSettings.keyHue || 'green';
  configSettings.bulletHue = configSettings.bulletHue || 'green';
  configSettings.numberHue = configSettings.numberHue || 'blue';
  configSettings.defaultSpacing = configSettings.defaultSpacing || 2;
  configSettings.disableColoring = !!configSettings.disableColoring;

  configSettings.strHue = configSettings.strHue || null;

  var outputLines = [];

  /**
   * Checks if a given value can be represented on a single line (serialized directly).
   * This includes primitive types, Dates, and single-line strings.
   *
   * @param {any} itemValue - The value to check.
   * @param {boolean} justSimpleTypes - If true, only checks for true primitives, not inline arrays.
   * @returns {boolean} - True if the value is suitable for single-line display.
   */
  var canBeInline = function (itemValue, justSimpleTypes) {
    if (
      typeof itemValue === 'boolean' ||
      typeof itemValue === 'number' ||
      itemValue === null ||
      itemValue instanceof Date
    ) {
      return true;
    }
    if (typeof itemValue === 'string' && itemValue.indexOf('\n') === -1) {
      return true;
    }

    if (configSettings.inlineArrays && !justSimpleTypes) {
      if (Array.isArray(itemValue) && canBeInline(itemValue[0], true)) {
        return true;
      }
    }

    return false;
  };

  /**
   * Indents each line within a multi-line string by a specified number of spaces.
   *
   * @param {string} textBlock - The string containing multiple lines.
   * @param {number} numSpaces - The number of spaces to prepend to each line.
   * @returns {string} - The indented string.
   */
  var prefixLinesWithSpaces = function (textBlock, numSpaces) {
    var textLines = textBlock.split('\n');
    textLines = textLines.map(function (currentLine) {
      return UtilitiesModule.padLeft(numSpaces) + currentLine;
    });
    return textLines.join('\n');
  };

  /**
   * Applies color formatting to a given value based on its type and configuration settings.
   *
   * @param {any} valueToColor - The value to which color should be applied.
   * @returns {string} - The color-formatted string representation of the value.
   */
  var applyColoring = function (valueToColor) {
    if (configSettings.disableColoring) {
      return valueToColor;
    }

    if (typeof valueToColor === 'string') {
      // For strings, apply the configured string color or return as-is.
      return configSettings.strHue ? valueToColor[configSettings.strHue] : valueToColor;
    }

    var stringValue = valueToColor + '';

    if (valueToColor === true) {
      return stringValue.green;
    }
    if (valueToColor === false) {
      return stringValue.red;
    }
    if (valueToColor === null) {
      return stringValue.grey;
    }
    if (typeof valueToColor === 'number') {
      return stringValue[configSettings.numberHue];
    }
    if (Array.isArray(valueToColor)) {
      return valueToColor.join(', ');
    }

    return stringValue;
  };

  // Main rendering logic based on the type of input data.
  if (canBeInline(inputData)) {
    outputLines.push(UtilitiesModule.padLeft(baseSpacing) + applyColoring(inputData));
  } else if (typeof inputData === 'string') {
    // If it's a string but not inline, it must be multi-line.
    outputLines.push(UtilitiesModule.padLeft(baseSpacing) + '"""');
    outputLines.push(prefixLinesWithSpaces(inputData, baseSpacing + configSettings.defaultSpacing));
    outputLines.push(UtilitiesModule.padLeft(baseSpacing) + '"""');
  } else if (Array.isArray(inputData)) {
    // Handle array types.
    if (inputData.length === 0) {
      outputLines.push(UtilitiesModule.padLeft(baseSpacing) + configSettings.emptyArrMessage);
    } else {
      inputData.forEach(function (arrItem) {
        // Prepend a bullet point for each array item.
        var outputLine = ('- ');
        if (!configSettings.disableColoring) {
          outputLine = outputLine[configSettings.bulletHue];
        }
        outputLine = UtilitiesModule.padLeft(baseSpacing) + outputLine;

        // If the array item is simple (string, boolean, number, null), display on the same line.
        if (canBeInline(arrItem)) {
          outputLine += exports.displayStructure(arrItem, configSettings);
          outputLines.push(outputLine);

          // For complex items (nested arrays or objects), render on the next line.
        } else {
          outputLines.push(outputLine);
          outputLines.push(
            exports.displayStructure(
              arrItem,
              configSettings,
              baseSpacing + configSettings.defaultSpacing
            )
          );
        }
      });
    }
  } else if (typeof inputData === 'object') {
    // Process object types.
    // Determine the longest key to align values aesthetically.
    var maxKeyLength = UtilitiesModule.getMaxIndexLength(inputData);
    var propKey;
    var isAnErrorObject = inputData instanceof Error;

    Object.getOwnPropertyNames(inputData).forEach(function (propertyName) {
      // Construct the key string with its label.
      propKey = (propertyName + ': ');
      if (!configSettings.disableColoring) {
        propKey = propKey[configSettings.keyHue];
      }
      propKey = UtilitiesModule.padLeft(baseSpacing) + propKey;

      // Skip `undefined` values as they are not standard JSON.
      if (inputData[propertyName] === undefined) {
        return;
      }

      // If the property value is simple and not an error stack, render on the same line.
      if (canBeInline(inputData[propertyName]) && (!isAnErrorObject || propertyName !== 'stack')) {
        propKey += exports.displayStructure(
          inputData[propertyName],
          configSettings,
          maxKeyLength - propertyName.length
        );
        outputLines.push(propKey);

        // For complex property values, render on the subsequent line.
      } else {
        outputLines.push(propKey);
        outputLines.push(
          exports.displayStructure(
            isAnErrorObject && propertyName === 'stack'
              ? inputData[propertyName].split('\n')
              : inputData[propertyName],
            configSettings,
            baseSpacing + configSettings.defaultSpacing
          )
        );
      }
    });
  }
  // Combine all generated lines into a single string, separated by newlines.
  return outputLines.join('\n');
};

/**
 * Parses a string containing JSON data and then formats it for display.
 * This function handles cases where the string might contain non-JSON prefixes.
 *
 * @param {string} sourceString - The string input that potentially contains JSON.
 * @param {object} userOptions - Configuration options for the display process.
 * @param {number} initialPad - The starting indentation level.
 * @returns {string} - The formatted string output, or an error message if parsing fails.
 *
 * Example options object:
 *
 *     {
 *       emptyArrMessage: '(empty list)', // Message for empty arrays
 *       keyHue: 'cyan',                  // Color for keys
 *       bulletHue: 'magenta',            // Color for array bullets
 *       defaultSpacing: 3                // Indentation for nested items
 *     }
 */
exports.parseAndDisplay = function (sourceString, userOptions, initialPad) {
  var finalResult = '';
  var processedData;

  // If the input is not a string or is empty, return an empty string.
  if (typeof sourceString !== 'string' || sourceString === '') {
    return '';
  }

  // Attempt to remove any non-JSON characters from the beginning of the string.
  if (sourceString[0] !== '{' && sourceString[0] !== '[') {
    var jsonStartPos;
    if (sourceString.indexOf('{') === -1) {
      jsonStartPos = sourceString.indexOf('[');
    } else if (sourceString.indexOf('[') === -1) {
      jsonStartPos = sourceString.indexOf('{');
    } else if (sourceString.indexOf('{') < sourceString.indexOf('[')) {
      jsonStartPos = sourceString.indexOf('{');
    } else {
      jsonStartPos = sourceString.indexOf('[');
    }
    finalResult += sourceString.substring(0, jsonStartPos) + '\n';
    sourceString = sourceString.substring(jsonStartPos);
  }

  try {
    processedData = JSON.parse(sourceString);
  } catch (err) {
    // If JSON parsing fails, return a formatted error message.
    return 'Error:'.red + ' Invalid JSON input!';
  }

  // Call the primary display function with the parsed data.
  finalResult += exports.displayStructure(processedData, userOptions, initialPad);
  return finalResult;
};