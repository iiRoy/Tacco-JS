/**
 * DataProcessor.js - A jQuery Plugin for Structured Text Manipulation
 * version: 1.0.0 (2023-10-27)
 *
 * This utility is distributed under the terms of the MIT License,
 * available at: http://www.opensource.org/licenses/mit-license.php
 *
 * This module is inspired by common patterns for parsing and serializing
 * delimited text data, particularly CSV, within client-side JavaScript.
 * The core regular expression logic for parsing owes its origin to a
 * StackOverflow contributor, Ridgerunner.
 * Reference:
 * - http://stackoverflow.com/q/8493195/290340
 *
 * Disclaimer: This software is provided "as is", without any warranty.
 * The developers are not liable for any damages arising from its use.
 * By utilizing this library, you acknowledge and accept all associated risks.
 *
 * We strive to deliver a reliable and extensible foundation for your data processing needs.
 *
 * Copyright 2023 by [Your Name/Organization Name - placeholder for original author Evan Plaice].
 */

(function( coreLib ) {
  // Define default configuration parameters for text parsing and serialization.
  // These settings can be overridden per operation.
  coreLib.dataProcessingConfig = {
    cellDelimiter: ',',
    textEncloser: '"',
    linesToSkipAtStart: 0,
    headerRowPosition: 1, // 1-based index for header row
    dataStartRowPosition: 2 // 1-based index for the first data row
  };

  /**
   * coreLib.decodeSingleEntry(sourceInput, operationConfig)
   * Transforms a single line of delimited text into a JavaScript array.
   *
   * @param {string} sourceInput The string containing the delimited data for one entry.
   * @param {object} [operationConfig] Optional object containing custom settings.
   *   Properties include:
   *   - `cellDelimiter`: Character used to separate individual data cells (default: ',').
   *   - `textEncloser`: Character used to enclose text values, especially those containing delimiters (default: '"').
   * @returns {Array|null} An array of parsed string values, or null if the input format is invalid.
   *
   * This function is optimized for processing a single row. For multi-row input,
   * consider using `coreLib.decodeMultiLineData`.
   */
  coreLib.decodeSingleEntry = function(sourceInput, operationConfig) {
    // Ensure configuration object is available, defaulting to an empty object if not provided.
    const currentConfig = operationConfig || {};
    // Retrieve or default the cell separator character.
    const fieldSep = currentConfig.cellDelimiter || coreLib.dataProcessingConfig.cellDelimiter;
    // Retrieve or default the text enclosure character.
    const strWrapper = currentConfig.textEncloser || coreLib.dataProcessingConfig.textEncloser;

    // Validate input: if the source is empty or not a string, return null early.
    if (typeof sourceInput !== 'string' || sourceInput.trim() === '') {
        return null;
    }

    // Construct the regular expression for validating the entire input line.
    // This pattern ensures the line adheres to basic delimited text structure.
    let validationPattern = new RegExp(
      `^\\s*(?:${strWrapper}[^${strWrapper}\\\\]*(?:\\\\[\\S\\s][^${strWrapper}\\\\]*)*${strWrapper}|[^${fieldSep}${strWrapper}\\s\\\\]*(?:\\s+[^${fieldSep}${strWrapper}\\\\]+)*)\\s*(?:${fieldSep}\\s*(?:${strWrapper}[^${strWrapper}\\\\]*(?:\\\\[\\S\\s][^${strWrapper}\\\\]*)*${strWrapper}|[^${fieldSep}${strWrapper}\\s\\\\]*(?:\\s+[^${fieldSep}${strWrapper}\\\\]+)*)\\s*)*$`
    );

    // Construct the regular expression for extracting individual cell values.
    // This pattern captures either quoted values (handling escaped quotes) or unquoted values.
    let valueExtractionPattern = new RegExp(
      `(?![\\s]*$)\\s*(?:${strWrapper}([^${strWrapper}\\\\]*(?:\\\\[\\S\\s][^${strWrapper}\\\\]*)*)${strWrapper}|([^${fieldSep}${strWrapper}\\s\\\\]*(?:\\s+[^${fieldSep}${strWrapper}\\\\]+)*))\\s*(?:${fieldSep}|$`, 'g'
    );

    // If the input string does not conform to the expected format, return null.
    if (!validationPattern.test(sourceInput)) {
      return null;
    }

    const collectedValues = [];
    // Process the string by iterating through matches and extracting values.
    // The `replace` method with a callback is used to effectively "walk" the string.
    sourceInput.replace(valueExtractionPattern, function(fullMatch, quotedValue, unquotedValue) {
      // If a quoted value was captured (group 1), process it.
      if (quotedValue !== undefined) {
        // Create a regex to unescape any internal text enclosures (e.g., `""` -> `"`).
        const unescapeQuotesRegex = new RegExp(`\\\\${strWrapper}`, 'g');
        collectedValues.push(quotedValue.replace(unescapeQuotesRegex, strWrapper));
      } else if (unquotedValue !== undefined) { // Otherwise, an unquoted value was captured (group 2).
        collectedValues.push(unquotedValue);
      }
      return ''; // Return empty string to continue replacement process (effectively just iterating).
    });

    // Special handling for a trailing empty field, which the regex might not capture.
    const trailingEmptyFieldPattern = new RegExp(`${fieldSep}\\s*$`);
    if (trailingEmptyFieldPattern.test(sourceInput)) {
      collectedValues.push('');
    }

    return collectedValues;
  };

  /**
   * coreLib.transformArrayToDelimitedString(inputArray, configOptions)
   * Converts a JavaScript array into a single line of delimited text.
   * Values are automatically quoted if they contain the delimiter or text encloser.
   *
   * @param {Array} inputArray An array of string or number values to be serialized.
   * @param {object} [configOptions] Optional settings for serialization.
   *   Properties include:
   *   - `cellDelimiter`: Character used to separate individual data cells (default: ',').
   *   - `textEncloser`: Character used to enclose text values (default: '"').
   * @returns {string} The serialized delimited string.
   *
   * This function focuses on a single row. For multi-row serialization,
   * refer to `coreLib.encodeMultiLineData`.
   */
  coreLib.transformArrayToDelimitedString = function(inputArray, configOptions) {
    // Validate input: ensure it's an array.
    if (!Array.isArray(inputArray)) {
        console.warn("Input for transformArrayToDelimitedString must be an array.");
        return "";
    }

    const currentSettings = configOptions || {};
    const colSeparator = currentSettings.cellDelimiter || coreLib.dataProcessingConfig.cellDelimiter;
    const strEncloser = currentSettings.textEncloser || coreLib.dataProcessingConfig.textEncloser;

    const processedCells = inputArray.map(value => {
      let cellValue = String(value); // Ensure all values are strings for consistent handling.

      // Check if the value needs quoting: contains separator, encloser, or newlines.
      const needsQuoting = cellValue.includes(colSeparator) ||
                           cellValue.includes(strEncloser) ||
                           cellValue.includes('\n') ||
                           cellValue.includes('\r');

      if (needsQuoting) {
        // Escape internal encloser characters by doubling them.
        cellValue = cellValue.replace(new RegExp(strEncloser, 'g'), strEncloser + strEncloser);
        // Enclose the entire value in the text encloser.
        return strEncloser + cellValue + strEncloser;
      }
      return cellValue;
    });

    // Join the processed cells with the column separator.
    return processedCells.join(colSeparator);
  };

  /**
   * coreLib.decodeMultiLineData(fullTextData, processingOptions)
   * Parses a multi-line delimited text string into a two-dimensional JavaScript array (matrix).
   *
   * @param {string} fullTextData The raw string containing all delimited data.
   * @param {object} [processingOptions] Optional configuration for parsing.
   *   Properties include:
   *   - `cellDelimiter`: Character separating cells.
   *   - `textEncloser`: Character enclosing text.
   *   - `linesToSkipAtStart`: Number of initial lines to ignore (e.g., comments, empty lines).
   * @returns {Array<Array<string>>} A matrix where each inner array represents a row of parsed string values.
   */
  coreLib.decodeMultiLineData = function(fullTextData, processingOptions) {
    const currentOptions = processingOptions || {};
    const colDiv = currentOptions.cellDelimiter || coreLib.dataProcessingConfig.cellDelimiter;
    const strWrap = currentOptions.textEncloser || coreLib.dataProcessingConfig.textEncloser;
    const initialRowsToSkip = currentOptions.linesToSkipAtStart || coreLib.dataProcessingConfig.linesToSkipAtStart;

    // Split the entire input data into individual lines, accommodating various line endings.
    const rawLines = fullTextData.split(/\r\n|\r|\n/g);
    const resultMatrix = [];
    let processedLineCount = 0; // Track lines processed after skipping.

    for (let i = 0; i < rawLines.length; i++) {
      // Skip lines based on the configuration.
      if (i < initialRowsToSkip) {
        continue;
      }

      const currentLine = rawLines[i].trim();
      // Skip empty lines or lines that are just whitespace after skipping initial lines.
      if (currentLine === '') {
        continue;
      }

      // Parse each non-skipped, non-empty line using the single entry decoder.
      const parsedRow = coreLib.decodeSingleEntry(currentLine, {
        textEncloser: strWrap,
        cellDelimiter: colDiv
      });

      // If a line cannot be parsed, log a warning and skip it, but continue processing others.
      if (parsedRow === null) {
        console.warn(`Skipping malformed line ${i + 1}: "${currentLine}"`);
        continue;
      }

      resultMatrix.push(parsedRow);
      processedLineCount++;
    }

    return resultMatrix;
  };

  /**
   * coreLib.encodeMatrixToCSV(inputMatrix, exportSettings)
   * Converts a two-dimensional JavaScript array (matrix) into a multi-line delimited text string.
   *
   * @param {Array<Array<string>>} inputMatrix The matrix of data to be serialized.
   * @param {object} [exportSettings] Optional configuration for the output string.
   *   Properties include:
   *   - `cellDelimiter`: Character separating cells.
   *   - `textEncloser`: Character enclosing text.
   * @returns {string} The complete delimited text string.
   */
  coreLib.encodeMatrixToCSV = function(inputMatrix, exportSettings) {
    if (!Array.isArray(inputMatrix) || inputMatrix.length === 0) {
      return ""; // Return empty string for empty or invalid input.
    }

    const outputLines = [];
    for (const row of inputMatrix) {
      // Ensure each 'row' is an array before processing.
      if (Array.isArray(row)) {
        outputLines.push(coreLib.transformArrayToDelimitedString(row, exportSettings));
      } else {
        console.warn("Skipping non-array element in inputMatrix:", row);
      }
    }
    return outputLines.join('\n'); // Join lines with a newline character.
  };

  /**
   * coreLib.convertCSVToObjects(sourceText, conversionSettings)
   * Transforms a multi-line delimited text string into an array of JavaScript objects.
   * The first identified header row determines the keys for these objects.
   *
   * @param {string} sourceText The raw delimited text data.
   * @param {object} [conversionSettings] Optional configuration.
   *   Properties include:
   *   - `cellDelimiter`: Character separating cells.
   *   - `textEncloser`: Character enclosing text.
   *   - `headerRowPosition`: 1-based index of the row containing headers.
   *   - `firstDataRowIndex`: 1-based index of the first row containing actual data.
   * @returns {Array<object>} An array of objects, where each object represents a data row.
   */
  coreLib.convertCSVToObjects = function(sourceText, conversionSettings) {
    const currentSettings = conversionSettings || {};
    const fieldSep = currentSettings.cellDelimiter || coreLib.dataProcessingConfig.cellDelimiter;
    const quoteChar = currentSettings.textEncloser || coreLib.dataProcessingConfig.textEncloser;
    const headerRowIndex = (currentSettings.headerRowPosition !== undefined ? currentSettings.headerRowPosition : coreLib.dataProcessingConfig.headerRowPosition);
    const firstDataRowIndex = (currentSettings.firstDataRowIndex !== undefined ? currentSettings.firstDataRowIndex : coreLib.dataProcessingConfig.dataStartRowPosition);

    // Input validation for string type.
    if (typeof sourceText !== 'string' || sourceText.trim() === '') {
        return [];
    }

    const allLines = sourceText.split(/\r\n|\r|\n/g);
    const recordList = [];

    // Adjust 1-based indices to 0-based for array access.
    const headerLineIdx = headerRowIndex - 1;
    const dataStartIdx = firstDataRowIndex - 1;

    // Fetch and parse the header line.
    if (headerLineIdx < 0 || headerLineIdx >= allLines.length) {
        console.error("Header row index is out of bounds.");
        return [];
    }
    const headerLabels = coreLib.decodeSingleEntry(allLines[headerLineIdx], {
      textEncloser: quoteChar,
      cellDelimiter: fieldSep
    });

    if (!headerLabels || headerLabels.length === 0) {
        console.error("Could not parse headers or headers are empty.");
        return [];
    }

    // Iterate through data lines starting from the specified data row.
    for (let i = dataStartIdx; i < allLines.length; i++) {
      const currentLineText = allLines[i].trim();

      // Skip empty lines within the data section.
      if (currentLineText === '') {
        continue;
      }

      const rowValues = coreLib.decodeSingleEntry(currentLineText, {
        textEncloser: quoteChar,
        cellDelimiter: fieldSep
      });

      if (rowValues === null) {
        console.warn(`Skipping malformed data line ${i + 1}: "${currentLineText}"`);
        continue;
      }

      // If data row has a different number of columns than headers, pad or truncate.
      if (rowValues.length !== headerLabels.length) {
          console.warn(`Data row ${i + 1} has ${rowValues.length} columns, but headers define ${headerLabels.length}. Adjusting.`);
          // Pad with nulls or truncate excess values to match header length.
          while (rowValues.length < headerLabels.length) {
              rowValues.push(null); // Pad with null for missing values.
          }
          rowValues.splice(headerLabels.length); // Truncate excess values.
      }


      const dataObject = {};
      // Map header labels to their corresponding values in the current row.
      for (let j = 0; j < headerLabels.length; j++) {
        dataObject[headerLabels[j]] = rowValues[j];
      }
      recordList.push(dataObject);
    }

    return recordList;
  };

  /**
   * coreLib.objectsToCSVString(inputRecords, exportOptions)
   * Converts an array of JavaScript objects into a multi-line delimited text string.
   * It automatically extracts headers from the first object and uses them for the header row.
   *
   * @param {Array<object>} inputRecords An array of objects to be serialized.
   * @param {object} [exportOptions] Optional configuration for output.
   *   Properties include:
   *   - `cellDelimiter`: Character separating cells.
   *   - `textEncloser`: Character enclosing text.
   * @returns {string} The complete delimited text string, including headers.
   */
  coreLib.objectsToCSVString = function(inputRecords, exportOptions) {
    if (!Array.isArray(inputRecords) || inputRecords.length === 0) {
      return ""; // Return empty string for empty or invalid input.
    }

    const outputRows = [];
    // Extract headers from the keys of the first object.
    // Assuming all objects have the same keys in the same order for simplicity,
    // or at least all relevant keys are present in the first object.
    const headerKeys = Object.keys(inputRecords[0]);

    // Serialize the header row.
    outputRows.push(coreLib.transformArrayToDelimitedString(headerKeys, exportOptions));

    // Serialize each data record.
    for (const record of inputRecords) {
      if (typeof record !== 'object' || record === null) {
          console.warn("Skipping non-object element in inputRecords:", record);
          continue;
      }
      const rowValues = headerKeys.map(key => record[key]);
      outputRows.push(coreLib.transformArrayToDelimitedString(rowValues, exportOptions));
    }

    return outputRows.join('\n'); // Join all rows with newline.
  };

})( jQuery );