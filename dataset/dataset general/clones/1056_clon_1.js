var fs = require( 'fs' );

var sourceMap = require( 'source-map' );


/**
 *  @function readSourceMap
 *  @description Reads a source map file from the specified path and
 *               returns a SourceMapConsumer instance.
 *
 *  @param {string} mapFilename - The full path to the source map file.
 *
 *  @returns {sourceMap.SourceMapConsumer} An initialized SourceMapConsumer object.
 *
 *  @throws {Error} If the file does not exist or contains invalid JSON.
 */
var readSourceMap = function ( mapFilename )
{
  // Variable to hold the parsed source map object.
  var map_data;

  // Check if the source map file exists at the given path.
  if ( !fs.existsSync( mapFilename ) )
  {
    // If the file is not found, throw an error indicating its absence.
    throw new Error( mapFilename + ": No such source map file" );
  }

  // Read the entire content of the source map file as a UTF-8 string.
  var mapFileContents = fs.readFileSync( mapFilename, 'utf8' );

  // Attempt to parse the file content as JSON.
  try
  {
    map_data = JSON.parse( mapFileContents );
  }
  catch ( error_message )
  {
    // If JSON parsing fails, indicate an invalid JSON format.
    throw new Error( mapFilename + ": Invalid JSON" );
  }

  // Create and return a new SourceMapConsumer instance from the parsed data.
  return new sourceMap.SourceMapConsumer( map_data );
}; // End of readSourceMap function definition.



/**
 *  @function concatenateSourceMaps
 *  @description Combines multiple source maps into a single source map.
 *               It takes an array of source map filenames and writes the
 *               resulting concatenated source map to a provided output stream.
 *
 *  @param {string}   sourceFilename  - The filename of the final generated source file.
 *  @param {string[]} mapFilenames    - An array of paths to the individual source map files.
 *  @param {WritableStream} output    - A writable stream to which the generated source map will be written.
 */
var concatenateSourceMaps = function ( sourceFilename, mapFilenames, output )
{
  // Initialize a new SourceMapGenerator for the combined output.
  var generated = new sourceMap.SourceMapGenerator( {
    // This 'file' property specifies the name of the output JavaScript file
    // that this generated source map will describe.
    file: sourceFilename
  } );

  // This variable keeps track of the current line offset for mappings
  // in the final concatenated source. It accumulates the line counts
  // from each processed source map.
  var combinedGeneratedLine = 0;

  // Iterate over each provided source map filename.
  mapFilenames.forEach( function ( currentMapFilename )
  {
    // Read and parse the current individual source map.
    var original_map_consumer = readSourceMap( currentMapFilename );

    // This variable will store the last generated line number from the
    // 'original_map_consumer' after all its mappings have been processed.
    var originalLastLine = null;

    // Iterate through each mapping entry in the current original source map.
    original_map_consumer.eachMapping( function ( mapping_entry )
    {
      // Add a new mapping to our combined source map generator.
      generated.addMapping( {
        // The generated location in the combined file.
        generated: {
          line: combinedGeneratedLine + mapping_entry.generatedLine,
          column: mapping_entry.generatedColumn
        },
        // The original location in the original source file.
        original: {
          line: mapping_entry.originalLine,
          column: mapping_entry.originalColumn
        },
        // The original source file name.
        source: mapping_entry.source
      } );

      // Update the last line seen from the current original source map.
      originalLastLine = mapping_entry.generatedLine;
    } ); // End of eachMapping iteration.

    // Increment the combined generated line counter by the last line
    // of the source map just processed. This prepares the offset for
    // the next source map.
    combinedGeneratedLine += originalLastLine;
  } ); // End of forEach iteration over mapFilenames.

  // Convert the generated source map object to its string representation (JSON)
  // and write it to the specified output stream.
  output.write( generated.toString() );
}; // End of concatenateSourceMaps function definition.


// Export the public API of this module.
module.exports = {
  // Alias for the readSourceMap function.
  read: readSourceMap,
  // Alias for the concatenateSourceMaps function.
  cat: concatenateSourceMaps
};