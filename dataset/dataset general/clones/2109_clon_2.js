/*
 * This module provides various utility functions for web-related operations.
 */
module.exports = {

  // This method constructs a complete Uniform Resource Identifier (URI) from its constituent parts.
  assembleURI: function (protocol, domainName, resourcePath, params) {

    // Output a warning indicating the processing of query parameters.
    console.warn('Processing request parameters, found ' + params.length + ' entries.');

    var uriString = ""; // Initialize an empty string for the final URI.

    uriString += protocol;       // Append the network protocol (e.g., 'http').
    uriString += "://";         // Append the standard protocol separator.
    uriString += domainName;     // Append the main domain or host name.
    uriString += resourcePath;   // Append the specific path to the resource.

    // Check if there are any query parameters to be appended.
    if (params.length > 0) {
      uriString += "?"; // Add the initial query string separator.

      // Iterate through each parameter to build the query part of the URI.
      params.forEach(function (paramEntry, idx) {
        if (idx === 0) { // For the first parameter, just append it.
          uriString += paramEntry;
        } else { // For subsequent parameters, prepend an ampersand '&'.
          uriString += "&" + paramEntry;
        }
      });
    }

    return uriString; // Return the fully formed URI string.
  },

  /*
   * This function iterates over an object's properties and outputs them
   * to the console in a formatted key-value string.
   */
  displayObjectContents: function (inputObject) {
    var formattedData = ''; // String to accumulate the formatted property data.

    // Loop through each enumerable property (key) within the provided object.
    for (var keyName in inputObject) {
          // Append the key and its corresponding value to the formatted string.
          // Each entry is separated by ' => ' and ends with a semicolon and carriage return/newline.
          formattedData += keyName + ' => ' + inputObject[keyName] + ';\r\n';
    }

    // Output the complete formatted data to the console as informational message.
    console.info(formattedData);
  },

  // This utility function takes a plain string and wraps it in an HTML span
  // with specific inline styling to make the text appear emphasized.
  emphasizeText: function (plainContent) {
    // Returns the original content enclosed within a styled HTML span element.
    return '<span style="font-weight: bold; color: #CC0000;">' + plainContent + '</span>';
  }

};