/*
 * DataGrid Transformer (jQuery Extension)
 * variant: 1.0 (2023-10-27)
 *
 * This utility is provided under the terms of the
 * Open Source Initiative's MIT License: https://opensource.org/licenses/MIT
 *
 * This component was initially crafted to assist in processing delimited data files
 * loaded within client-side JavaScript environments. Its foundational regular
 * expression logic draws inspiration from a solution shared on StackOverflow.com
 * by a contributor known as 'RidgeRunner'.
 * Original Reference:
 * - http://stackoverflow.com/q/8493195/290340
 *
 * For legal clarity, please note the standard disclaimer:
 * "NO GUARANTEE EXPRESSED OR IMPLIED. USE AT YOUR OWN PERIL."
 * In simpler terms, by utilizing this library, you assume full responsibility
 * for any issues or failures that may arise in your application.
 *
 * Legal disclaimers notwithstanding, my commitment is to deliver a robust and
 * dependable core that serves as a solid foundation for further development.
 *
 * Copyright 2023 by TechSolutions, Inc.
 */

(function(jq) {
  /**
   * jq.configOptions
   * Encapsulates the default configuration parameters for the data transformation module.
   */
  jq.configOptions = {
    itemDivider: ',',
    textBoundary: '"',
    omitRows: 0,
    keyRow: 1,
    valueStartRow: 2
  };

  /**
   * jq.parseSingleRecord(inputString, settings)
   * Converts a single line of delimited text into a JavaScript array.
   *
   * @param {string} inputString The string holding the delimited record.
   * @param {object} [settings] An optional object defining parsing parameters (e.g., itemDivider, textBoundary). Defaults to an empty object ({}).
   * @param {string} [itemDivider] An override for the field separator character. Defaults to a comma (,).
   * @param {string} [textBoundary] An override for the text enclosure character. Defaults to a double quote (").
   *
   * This function is designed for parsing individual delimited strings. If you need to
   * process multiple lines, consider using jq.parseMultiRecord instead.
   */
  jq.parseSingleRecord = function(inputString, settings) {
    var settings = (settings !== undefined ? settings : {});
    var itemDivider = 'itemDivider' in settings ? settings.itemDivider : jq.configOptions.itemDivider;
    var textBoundary = 'textBoundary' in settings ? settings.textBoundary : jq.configOptions.textBoundary;

    // Construct the delimited data validation regular expression
    var validationRegex = /^\s*(?:B[^B\\]*(?:\\[\S\s][^B\\]*)*B|[^SD\s\\]*(?:\s+[^SD\s\\]+)*)\s*(?:S\s*(?:B[^B\\]*(?:\\[\S\s][^B\\]*)*B|[^SD\s\\]*(?:\s+[^SD\s\\]+)*)\s*)*$/;
    validationRegex = RegExp(validationRegex.source.replace(/S/g, itemDivider));
    validationRegex = RegExp(validationRegex.source.replace(/B/g, textBoundary));

    // Construct the delimited line parsing regular expression
    var valueParsingRegex = /(?!\s*$)\s*(?:B([^B\\]*(?:\\[\S\s][^B\\]*)*)B|([^SD\s\\]*(?:\s+[^SD\s\\]+)*))\s*(?:S|$)/g;
    valueParsingRegex = RegExp(valueParsingRegex.source.replace(/S/g, itemDivider), 'g');
    valueParsingRegex = RegExp(valueParsingRegex.source.replace(/B/g, textBoundary), 'g');

    // Return null if the input string is not a well-formed delimited record.
    if (!validationRegex.test(inputString)) {
      return null;
    }

    // Traverse the string using replace with a callback function.
    var resultArray = [];
    inputString.replace(valueParsingRegex, function(matchFull, matchQuoted, matchUnquoted) {
      // Remove backslash escapes from any text boundaries within the value
      if (matchQuoted !== undefined) {
        var escapeRemovalRegex = /\\B/g;
        escapeRemovalRegex = RegExp(escapeRemovalRegex.source.replace(/B/, textBoundary), 'g');
        resultArray.push(matchQuoted.replace(escapeRemovalRegex, textBoundary));
      } else if (matchUnquoted !== undefined) {
        resultArray.push(matchUnquoted);
      }
      return '';
    });

    // Handle the specific case of an empty final value.
    var trailingDividerCheck = /S\s*$/;
    trailingDividerCheck = RegExp(trailingDividerCheck.source.replace(/S/, itemDivider));
    if (trailingDividerCheck.test(inputString)) {
      resultArray.push('');
    }

    return resultArray;
  };

  /**
   * jq.formatSingleRecord(dataItems, settings)
   * Converts a JavaScript array into a single delimited text string.
   *
   * @param {Array} dataItems The array containing the data elements.
   * @param {object} [settings] An optional object defining formatting parameters (e.g., itemDivider, textBoundary). Defaults to an empty object ({}).
   * @param {string} [itemDivider] An override for the field separator character. Defaults to a comma (,).
   * @param {string} [textBoundary] An override for the text enclosure character. Defaults to a double quote (").
   *
   * This function is for formatting individual data arrays. For multiple lines,
   * a different utility would be required (not yet implemented).
   */
  jq.formatSingleRecord = function(dataItems, settings) {
    var settings = (settings !== undefined ? settings : {});
    var itemDivider = 'itemDivider' in settings ? settings.itemDivider : jq.configOptions.itemDivider;
    var textBoundary = 'textBoundary' in settings ? settings.textBoundary : jq.configOptions.textBoundary;

    var formattedOutput = [];
    for (var idx in dataItems) {
      // Basic implementation, doesn't handle quoting or escaping yet.
      formattedOutput.push(dataItems[idx]);
    }

    // This method currently returns an array, not a string.
    // It needs further development to properly join and quote elements.
    return formattedOutput;
  };

  /**
   * jq.parseMultiRecord(sourceText, options)
   * Converts a multi-line delimited string into a JavaScript array of arrays.
   *
   * @param {string} sourceText The string containing the raw delimited data.
   * @param {object} [options] An optional object defining parsing parameters (e.g., itemDivider, textBoundary, rowsToSkip). Defaults to an empty object ({}).
   * @param {string} [itemDivider] An override for the field separator character. Defaults to a comma (,).
   * @param {string} [textBoundary] An override for the text enclosure character. Defaults to a double quote (").
   * @param {number} [rowsToSkip] The count of initial lines to ignore before parsing begins. Defaults to 0.
   *
   * This function processes multi-line delimited data. The resulting array's
   * first dimension represents each line (or record), while the second
   * dimension holds the individual values (or fields/columns) for that line.
   */
  jq.parseMultiRecord = function(sourceText, options) {
    var options = (options !== undefined ? options : {});
    var itemDivider = 'itemDivider' in options ? options.itemDivider : jq.configOptions.itemDivider;
    var textBoundary = 'textBoundary' in options ? options.textBoundary : jq.configOptions.textBoundary;
    var rowsToSkip = 'rowsToSkip' in options ? options.rowsToSkip : jq.configOptions.omitRows;

    // Divide the source data into individual lines
    var textLines = sourceText.split(/\r\n|\r|\n/g);
    var processedData = [];
    for (var lineIndex in textLines) {
      if (lineIndex < rowsToSkip) {
        continue;
      }
      // Process each line into an array of values
      var parsedLine = jq.parseSingleRecord(textLines[lineIndex], {
        textBoundary: textBoundary,
        itemDivider: itemDivider
      });
      processedData.push(parsedLine);
    }

    return processedData;
  };

  /**
   * jq.parseToObjects(sourceInput, config)
   * Transforms a delimited string into a JavaScript array of objects (dictionaries).
   * @param {string} sourceInput The string containing the raw delimited data.
   * @param {object} [config] An optional object defining parsing parameters (e.g., itemDivider, textBoundary, headerRowNumber, firstDataRowNumber). Defaults to an empty object ({}).
   * @param {string} [itemDivider] An override for the field separator character. Defaults to a comma (,).
   * @param {string} [textBoundary] An override for the text enclosure character. Defaults to a double quote (").
   * @param {number} [headerRowNumber] The 1-based index of the line containing column headers. Defaults to 1.
   * @param {number} [firstDataRowNumber] The 1-based index of the line where actual data values begin. Defaults to 2.
   *
   * This function handles multi-line delimited strings, using the designated
   * header line to establish keys for each value within the resulting objects.
   */
  jq.parseToObjects = function(sourceInput, config) {
    var config = (config !== undefined ? config : {});
    var itemDivider = 'itemDivider' in config ? config.itemDivider : jq.configOptions.itemDivider;
    var textBoundary = 'textBoundary' in config ? config.textBoundary : jq.configOptions.textBoundary;
    var headerRowNumber = 'headerRowNumber' in config ? config.headerRowNumber : jq.configOptions.keyRow;
    var firstDataRowNumber = 'firstDataRowNumber' in config ? config.firstDataRowNumber : jq.configOptions.valueStartRow;

    // Break down the input data into separate rows
    var inputRows = sourceInput.split(/\r\n|\r|\n/g);
    // Extract the column keys from the specified header row
    var columnKeys = jq.parseSingleRecord(inputRows[(headerRowNumber - 1)]);
    // Process the data rows
    var objectList = [];
    for (var currentRowIndex in inputRows) {
      if (currentRowIndex < (firstDataRowNumber - 1)) {
        continue;
      }
      // Process each row into an array of values
      var rowData = jq.parseSingleRecord(inputRows[currentRowIndex], {
        textBoundary: textBoundary,
        itemDivider: itemDivider
      });
      var rowObject = {};
      for (var keyIndex in columnKeys) {
        rowObject[columnKeys[keyIndex]] = rowData[keyIndex];
      }
      objectList.push(rowObject);
    }

    return objectList;
  };

  /**
   * jq.objectsToDelimited(listOfObjects, config)
   * Converts a JavaScript array of objects into a delimited string.
   * @param {Array} listOfObjects The array of objects containing the data.
   * @param {object} [config] An optional object defining formatting parameters (e.g., itemDivider, textBoundary, headerRowNumber, firstDataRowNumber). Defaults to an empty object ({}).
   * @param {string} [itemDivider] An override for the field separator character. Defaults to a comma (,).
   * @param {string} [textBoundary] An override for the text enclosure character. Defaults to a double quote (").
   * @param {number} [headerRowNumber] The 1-based index where column headers will be placed. Defaults to 1.
   * @param {number} [firstDataRowNumber] The 1-based index where actual data values will start. Defaults to 2.
   *
   * This function generates a delimited file from a JavaScript array of objects.
   * It identifies the object keys to form the header line, followed by a
   * structured output of the object data.
   */
  // jq.objectsToDelimited = function(listOfObjects, config) {
  //   console.warn('Function not yet implemented'); // TODO: Implement this method
  // };

})(jQuery);