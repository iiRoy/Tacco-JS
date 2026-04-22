const fileSysUtil = require('fs');

const srcMappingLib = require('source-map');

/**
 * Generates a consistent error object for issues encountered during file operations.
 * This helper ensures uniformity in error reporting.
 *
 * @param {string} filePath - The path to the file that caused the problem.
 * @param {string} issueDescription - A detailed message describing the error.
 * @returns {Error} A new Error instance tailored for file processing failures.
 */
function createFileProcessingError(filePath, issueDescription) {
  return new Error(`File Operation Failure: '${filePath}' - ${issueDescription}`);
}

/**
 * Interprets and loads a source map file from the local filesystem.
 * This function handles file existence checks, reading, and JSON parsing.
 *
 * @param {string} mappingFilePath - The absolute or relative path to the source map file (e.g., 'dist/bundle.js.map').
 * @returns {srcMappingLib.SourceMapConsumer} An initialized SourceMapConsumer object ready for query.
 * @throws {Error} If the provided path is invalid, the file cannot be accessed, or its content is malformed.
 */
const parseMappingFile = (mappingFilePath) => {
  // Enforce strong typing and non-emptiness for the input path.
  if (typeof mappingFilePath !== 'string' || mappingFilePath.trim().length === 0) {
    throw new Error("Input Validation: 'mappingFilePath' must be a non-empty string for source map parsing.");
  }

  // Verify the file exists before attempting I/O operations. This allows for a more specific error.
  if (!fileSysUtil.existsSync(mappingFilePath)) {
    throw createFileProcessingError(mappingFilePath, "The specified source map file does not exist.");
  }

  let fileContentBuffer; // Will hold the raw text content of the map file.
  try {
    // Synchronously read the entire file content, expecting UTF-8 encoding.
    fileContentBuffer = fileSysUtil.readFileSync(mappingFilePath, { encoding: 'utf8' });
  } catch (readErr) {
    // Capture and re-throw any errors that occur during the file reading process itself.
    throw createFileProcessingError(mappingFilePath, `Failed to read its contents: ${readErr.message}`);
  }

  // Basic check for empty or whitespace-only files, which cannot be valid JSON.
  if (fileContentBuffer.trim().length === 0) {
      throw createFileProcessingError(mappingFilePath, "File is empty or contains only whitespace, thus not a valid JSON source map.");
  }

  let parsedMapData; // Will store the JavaScript object after JSON parsing.
  try {
    // Attempt to parse the file content as a JSON object.
    parsedMapData = JSON.parse(fileContentBuffer);
  } catch (jsonParseError) {
    // If JSON parsing fails, it indicates an invalid source map structure.
    throw createFileProcessingError(mappingFilePath, `Contains invalid JSON data: ${jsonParseError.message}`);
  }

  // Construct and return a new SourceMapConsumer instance from the parsed data.
  // This object provides the API to traverse and interpret the source map.
  return new srcMappingLib.SourceMapConsumer(parsedMapData);
};

/**
 * Aggregates a series of individual source maps into a single, comprehensive source map.
 * This is particularly useful when concatenating multiple JavaScript files that each have
 * their own source maps. The resulting map correctly offsets original positions.
 *
 * @param {string} outputFileName - The logical filename of the final bundled output (e.g., 'app.min.js').
 *                                  This name is embedded in the generated source map.
 * @param {Array<string>} inputMapPaths - An ordered list of file paths to the individual source map files.
 *                                     The order is crucial as it dictates the concatenation sequence.
 * @param {object} outputStream - An object with a `write` method (e.g., `process.stdout`, a file stream)
 *                                where the final JSON string of the merged source map will be written.
 * @returns {void} This function performs a side effect (writing to a stream) and does not return a value.
 * @throws {Error} For invalid input parameters, or if any individual source map cannot be processed.
 */
const mergeSourceMaps = (outputFileName, inputMapPaths, outputStream) => {
  // Comprehensive input validation for the function's parameters.
  if (typeof outputFileName !== 'string' || outputFileName.trim().length === 0) {
    throw new Error("Parameter Error: 'outputFileName' must be a non-empty string representing the final asset name.");
  }
  if (!Array.isArray(inputMapPaths)) {
    throw new Error("Parameter Error: 'inputMapPaths' must be an array containing paths to individual source map files.");
  }
  if (!outputStream || typeof outputStream.write !== 'function') {
    throw new Error("Parameter Error: 'outputStream' must be an object exposing a 'write' method for outputting the map.");
  }

  // Handle the edge case where no input maps are provided. Generate an empty map.
  if (inputMapPaths.length === 0) {
    const emptyMapGenerator = new srcMappingLib.SourceMapGenerator({ file: outputFileName });
    outputStream.write(emptyMapGenerator.toString());
    return; // Exit early as there's nothing to merge.
  }

  // Initialize the primary source map generator. This object will accumulate all mappings.
  const compositeMapGenerator = new srcMappingLib.SourceMapGenerator({
    // The 'file' property is a crucial metadata field in the generated source map.
    file: outputFileName
  });

  // This variable tracks the cumulative number of lines that have been processed and added
  // to the generated output from all preceding source maps. It's used as an offset.
  let accumulatedOutputLines = 0;

  // Iterate over each source map path provided in the input array.
  for (const currentMapPath of inputMapPaths) {
    // Validate each path within the array to prevent unexpected behavior.
    if (typeof currentMapPath !== 'string' || currentMapPath.trim().length === 0) {
        throw new Error(`Parameter Error: An entry in 'inputMapPaths' is not a valid string path: '${currentMapPath}'`);
    }

    // Parse the current source map file into a consumer object. This may throw.
    const currentMapConsumer = parseMappingFile(currentMapPath);

    // This variable will keep track of the highest generated line number observed
    // within the *current* source map being processed. This value is essential
    // for calculating the line contribution of the current map.
    let currentMapMaxGenLine = 0;

    // Process each individual mapping entry within the current source map.
    currentMapConsumer.eachMapping((singleMappingEntry) => {
      // Add a new mapping to the composite generator.
      // The `generated.line` needs to be adjusted by `accumulatedOutputLines`
      // to correctly place it in the concatenated output.
      compositeMapGenerator.addMapping({
        generated: {
          line: accumulatedOutputLines + singleMappingEntry.generatedLine,
          column: singleMappingEntry.generatedColumn
        },
        original: {
          line: singleMappingEntry.originalLine,
          column: singleMappingEntry.originalColumn
        },
        source: singleMappingEntry.source // Refers to the original source file.
      });

      // Update the maximum generated line for the current map.
      // This ensures we capture the total line count contributed by this map.
      if (singleMappingEntry.generatedLine > currentMapMaxGenLine) {
          currentMapMaxGenLine = singleMappingEntry.generatedLine;
      }
    });

    // After processing all mappings for the `currentMapConsumer`,
    // increment the `accumulatedOutputLines` by the total lines this map contributed.
    accumulatedOutputLines += currentMapMaxGenLine;

    // Destroy the consumer to release any underlying resources, especially important
    // when processing a large number of source maps.
    currentMapConsumer.destroy();
  }

  // Convert the final composite source map object into its JSON string representation.
  const finalMapString = compositeMapGenerator.toString();

  // Write the complete source map string to the designated output stream.
  outputStream.write(finalMapString);
};

// Expose the core functionalities of this module.
module.exports = {
  readMap: parseMappingFile,
  mergeMaps: mergeSourceMaps
};