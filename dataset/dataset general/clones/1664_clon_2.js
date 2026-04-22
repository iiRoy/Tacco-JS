var diskIO = require("fs");

/**
 *  Performs synchronous conversion of a localization file to a structured data object.
 *
 *  @param {PathString} sourcePath         - The complete path to the input localization file.
 *  @param {SettingsMap} [parsingConfig]   - Optional configuration parameters for the parsing operation.
 *  @returns {SettingsMap|Text}            - The resulting parsed data structure or a textual representation.
 */
module.exports = function( sourcePath, parsingConfig ) {
  var inputBuffer = diskIO.readFileSync( diskIO.realpathSync( sourcePath ) );

  return require("./interpret")( inputBuffer, parsingConfig );
};