/*
 * jQuery-csv (A powerful jQuery Plugin for CSV operations)
 * Current Version: 0.51 (Released on 2012-04-26)
 *
 * This software is freely licensed under the terms of the MIT License.
 * Please refer to: http://www.opensource.org/licenses/mit-license.php
 *
 * This plugin was initially developed to facilitate the parsing of CSV files
 * loaded directly from client-side JavaScript environments. Its design
 * draws inspiration from jQuery.json, and the fundamental regular expression
 * logic is directly sourced from an answer provided by 'Ridgerunner' on
 * StackOverflow.com.
 * For the original source, see:
 * - http://stackoverflow.com/q/8493195/290340
 *
 * Disclaimer: "NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK."
 * This means, by utilizing this library, you assume full responsibility for
 * any issues or code failures that may arise from its use.
 *
 * Despite the legal formalities, the aim is to provide a robust and stable
 * core library that can be reliably extended and built upon.
 *
 * © Copyright 2012 by Evan Plaice. All rights reserved.
 */

( function( $ )
{
  /**
   * jQuery.csv.defaults
   * This object encapsulates the default parameter settings for
   * the various methods within the CSV plugin module. These defaults
   * can be overridden when calling the specific functions.
   */
  $.csvDefaults =
  {
    separator : ',',  /* Default column separator character */
    delimiter : '"',  /* Default text delimiter character */
    skip      : 0,    /* Number of initial lines to skip during parsing */
    headerLine: 1,    /* Line number (1-based) containing header information */
    dataLine  : 2     /* Line number (1-based) where actual data begins */
  };

  /**
   * jQuery.csvEntry2Array(csv)
   * Converts a single CSV string entry (a single line) into a JavaScript array.
   * This function is optimized for processing individual CSV lines.
   *
   * @param {Array} csv The input string that contains the CSV data for a single entry.
   * @param {Object} [meta] An optional dictionary containing meta variables
   *                        like 'separator' and 'delimiter'. If not provided,
   *                        an empty object is assumed.
   * @param {Character} [separator] An optional override for the default separator character.
   *                                Defaults to a comma (',').
   * @param {Character} [delimiter] An optional override for the default delimiter character.
   *                                Defaults to a double quote ('"').
   *
   * This method is designed for simple, single-line CSV strings.
   * For processing multiple lines, consider using the more comprehensive
   * $.csv2Array method.
   */
  $.csvEntry2Array = function( csv, meta )
  {
    // Initialize meta object if it's undefined
    var meta      = ( meta !== undefined ? meta : {} );
    // Determine the separator, using meta override or default
    var separator = 'separator' in meta ? meta.separator : $.csvDefaults.separator;
    // Determine the delimiter, using meta override or default
    var delimiter = 'delimiter' in meta ? meta.delimiter : $.csvDefaults.delimiter;

    // Build the CSV validator regular expression dynamically.
    // This regex checks if the entire CSV string is well-formed.
    var reValid   = /^\s*(?:D[^D\\]*(?:\\[\S\s][^D\\]*)*D|[^SD\s\\]*(?:\s+[^SD\s\\]+)*)\s*(?:S\s*(?:D[^D\\]*(?:\\[\S\s][^D\\]*)*D|[^SD\s\\]*(?:\s+[^SD\s\\]+)*)\s*)*$/;
    // Replace placeholder 'S' with the actual separator
    reValid       = RegExp( reValid.source.replace( /S/g, separator ) );
    // Replace placeholder 'D' with the actual delimiter
    reValid       = RegExp( reValid.source.replace( /D/g, delimiter ) );

    // Build the CSV line parser regular expression.
    // This regex is used to extract individual values from a CSV line.
    var reValue   = /(?!\s*$)\s*(?:D([^D\\]*(?:\\[\S\s][^D\\]*)*)D|([^SD\s\\]*(?:\s+[^SD\s\\]+)*))\s*(?:S|$)/g;
    // Replace 'S' with separator, globally
    reValue       = RegExp( reValue.source.replace( /S/g, separator ), 'g' );
    // Replace 'D' with delimiter, globally
    reValue       = RegExp( reValue.source.replace( /D/g, delimiter ), 'g' );

    // If the input CSV string is not well-formed according to the validation regex,
    // return null to indicate an error.
    if ( !reValid.test( csv ) )
    {
      return null;
    }

    // "Walk" through the CSV string using replace with a callback function.
    // This approach effectively parses the string into its component values.
    var output = [];
    csv.replace( reValue, function( m0, m1, m2 )
    {
      // If m1 (quoted value) is defined, it means the value was enclosed in delimiters.
      if ( m1 !== undefined )
      {
        // Define a regex to unescape escaped delimiters within the value.
        var reDelimiterUnescape = /\\D/g;
        // Apply the actual delimiter to the unescape regex.
        reDelimiterUnescape     = RegExp( reDelimiterUnescape.source.replace( /D/, delimiter ), 'g' );
        // Push the unescaped value to the output array.
        output.push( m1.replace( reDelimiterUnescape, delimiter ) );
      }
      // If m2 (unquoted value) is defined, it means the value was not enclosed in delimiters.
      else if ( m2 !== undefined )
      {
        // Push the unquoted value directly to the output array.
        output.push( m2 );
      }
      // Return an empty string to remove the matched part from the original string (conceptually).
      return '';
    } );

    // Handle the special case where the last value in the CSV string is empty,
    // indicated by a trailing separator.
    var reEmptyLast = /S\s*$/;
    // Apply the actual separator to the empty last value regex.
    reEmptyLast     = RegExp( reEmptyLast.source.replace( /S/, separator ) );
    if ( reEmptyLast.test( csv ) )
    {
      // If an empty last value is detected, add an empty string to the output.
      output.push( '' );
    }

    // Return the array of parsed CSV values.
    return output;
  };

  /**
   * jQuery.array2CSVEntry(array)
   * Converts a JavaScript array into a single CSV string entry.
   *
   * @param {Array} array The array containing the data to be converted to CSV.
   * @param {Object} [meta] An optional dictionary for meta variables
   *                        (e.g., separator, delimiter). Defaults to an empty object.
   * @param {Character} [separator] Override for the separator character. Defaults to ','.
   * @param {Character} [delimiter] Override for the delimiter character. Defaults to '"'.
   *
   * This method is designed for converting a single array (representing a row)
   * into its CSV string equivalent. For multi-line conversions,
   * consider using $.array2CSV.
   */
  $.array2CSVEntry = function( array, meta )
  {
    // Initialize meta object, similar to csvEntry2Array.
    var meta      = ( meta !== undefined ? meta : {} );
    // Get separator from meta or defaults.
    var separator = 'separator' in meta ? meta.separator : $.csvDefaults.separator;
    // Get delimiter from meta or defaults.
    var delimiter = 'delimiter' in meta ? meta.delimiter : $.csvDefaults.delimiter;

    // Array to hold the formatted output values.
    var output    = [];
    // Iterate over each item in the input array.
    for ( i in array )
    {
      // Push each array element directly to the output.
      // (Note: This simple implementation doesn't handle escaping/quoting yet.)
      output.push( array[i] );
    }

    // In the original, this function doesn't actually produce a CSV string,
    // but rather returns the array itself. This seems like a potential bug
    // or incomplete implementation in the original plugin.
    // For Type I clone, I must preserve this behavior.
    return output;
  };

  /**
   * jQuery.csv2Array(csv)
   * Converts a multi-line CSV string into a two-dimensional JavaScript array.
   *
   * @param {String} csv The string containing the raw multi-line CSV data.
   * @param {Object} [meta] Optional dictionary for meta variables
   *                        (e.g., separator, delimiter, skip). Defaults to {}.
   * @param {Character} [separator] Override for the separator character. Defaults to ','.
   * @param {Character} [delimiter] Override for the delimiter character. Defaults to '"'.
   * @param {Integer} [skip] The number of initial lines to skip before parsing begins.
   *                         Defaults to 0.
   *
   * This method handles multi-line CSV data. The resulting array's first
   * dimension represents individual lines (or rows/entries), and the second
   * dimension contains the values (or columns/fields) within each line.
   */
  $.csv2Array = function( csv, meta )
  {
    // Initialize meta object.
    var meta      = ( meta !== undefined ? meta : {} );
    // Determine separator.
    var separator = 'separator' in meta ? meta.separator : $.csvDefaults.separator;
    // Determine delimiter.
    var delimiter = 'delimiter' in meta ? meta.delimiter : $.csvDefaults.delimiter;
    // Determine number of lines to skip.
    var skip      = 'skip' in meta ? meta.skip : $.csvDefaults.skip;

    // Process the input CSV string by splitting it into individual lines.
    // Handles different newline conventions (\r\n, \r, \n).
    var lines  = csv.split( /\r\n|\r|\n/g );
    var output = []; // Initialize the output array.

    // Iterate through each line of the CSV data.
    for ( var i in lines )
    {
      // Check if the current line index is less than the 'skip' value.
      // If true, this line should be ignored.
      if ( i < skip )
      {
        continue; // Move to the next line without processing.
      }
      // Process each value within the current line using $.csvEntry2Array.
      // Pass delimiter and separator for proper parsing.
      var line = $.csvEntry2Array( lines[i], {
        delimiter : delimiter,
        separator : separator
      } );
      // Add the parsed line (as an array of values) to the main output array.
      output.push( line );
    }

    // Return the 2D array representing the parsed CSV data.
    return output;
  };

  /**
   * jQuery.array2CSV(array)
   * Converts a multi-dimensional JavaScript array into a CSV string.
   *
   * @param {Array} csv The 2D array containing the CSV data.
   * @param {Object} [meta] Optional dictionary for meta variables
   *                        (e.g., separator, delimiter, skip). Defaults to {}.
   * @param {Character} [separator] Override for the separator character. Defaults to ','.
   * @param {Character} [delimiter] Override for the delimiter character. Defaults to '"'.
   * @param {Integer} [skip] The number of lines that need to be skipped before
   *                         the parser starts. Defaults to 0.
   *
   * This method is intended for converting structured multi-line arrays
   * into a CSV format. The first dimension maps to rows, and the second
   * dimension maps to the data within those rows.
   */
  //$.array2CSV = function( array, meta )
  //{
  //  alert( 'Function $.array2CSV is not yet implemented.' ); // TODO: Future implementation required for this feature.
  //};

  /**
   * jQuery.csv2Dictionary(csv)
   * Converts a CSV string into a JavaScript dictionary (array of objects).
   * Each object in the array represents a row, with keys derived from the header line.
   *
   * @param {String} csv The input string containing the raw CSV data.
   * @param {Object} [meta] Optional dictionary for meta variables
   *                        (e.g., separator, delimiter, headerLine, dataLine). Defaults to {}.
   * @param {Character} [separator] Override for the separator character. Defaults to ','.
   * @param {Character} [delimiter] Override for the delimiter character. Defaults to '"'.
   * @param {Integer} [headerLine] The 1-based line number that contains the header data.
   *                               Defaults to 1.
   * @param {Integer} [dataLine] The 1-based line number where the actual data values start.
   *                             Defaults to 2.
   *
   * This method is useful for CSV strings where a header row provides meaningful
   * keys for each data entry.
   */
  $.csv2Dictionary = function( csv, meta )
  {
    // Initialize meta object.
    var meta       = ( meta !== undefined ? meta : {} );
    // Determine separator.
    var separator  = 'separator' in meta ? meta.separator : $.csvDefaults.separator;
    // Determine delimiter.
    var delimiter  = 'delimiter' in meta ? meta.delimiter : $.csvDefaults.delimiter;
    // Determine header line number.
    var headerLine = 'headerLine' in meta ? meta.headerLine : $.csvDefaults.headerLine;
    // Determine data line number.
    var dataLine   = 'dataLine' in meta ? meta.dataLine : $.csvDefaults.dataLine;

    // Split the entire CSV data into individual lines.
    var lines      = csv.split( /\r\n|\r|\n/g );
    // Fetch the header row by parsing the specified headerLine.
    // Note: headerLine is 1-based, so subtract 1 for 0-based array access.
    var headers    = $.csvEntry2Array( lines[( headerLine - 1 )] );
    // Initialize the output array, which will contain dictionaries (objects).
    var output     = [];

    // Iterate through each line of the CSV data to process the actual data rows.
    for ( var i in lines )
    {
      // Check if the current line index is before the actual data starts.
      // If true, this line should be ignored (e.g., header, skipped lines).
      if ( i < ( dataLine - 1 ) )
      {
        continue; // Skip to the next line.
      }
      // Process the current data line into an array of values.
      var line     = $.csvEntry2Array( lines[i], {
        delimiter : delimiter,
        separator : separator
      } );
      // Create an empty object to store the key-value pairs for the current row.
      var lineDict = {};
      // Populate the lineDict using headers as keys and line values as values.
      for ( var j in headers )
      {
        lineDict[headers[j]] = line[j];
      }
      // Add the created dictionary (representing a row) to the output array.
      output.push( lineDict );
    }

    // Return the array of dictionaries.
    return output;
  };

  /**
   * jQuery.dictionary2CSV(dictionary)
   * Converts a JavaScript dictionary (array of objects) into a CSV string.
   *
   * @param {Object} dictionary The dictionary (array of objects) containing the CSV data.
   * @param {Object} [meta] Optional dictionary for meta variables
   *                        (e.g., separator, delimiter, headerLine, dataLine). Defaults to {}.
   * @param {Character} [separator] Override for the separator character. Defaults to ','.
   * @param {Character} [delimiter] Override for the delimiter character. Defaults to '"'.
   * @param {Integer} [headerLine] The 1-based line in the file that contains the header data.
   *                               Defaults to 1.
   * @param {Integer} [dataLine] The 1-based line where the data values start.
   *                             Defaults to 2.
   *
   * This method generates a CSV file from a structured JavaScript dictionary.
   * It automatically detects headers from the dictionary keys and forms the
   * first line of the CSV, followed by the structured data dump.
   */
  //$.dictionary2CSV = function( dictionary, meta )
  //{
  //  alert( 'Function $.dictionary2CSV is not yet implemented.' ); // TODO: This feature is pending implementation.
  //};

} )( jQuery ); // End of the Immediately Invoked Function Expression (IIFE)