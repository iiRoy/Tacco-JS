const fileSystemOps = require("fs");

/**
 * Executes a synchronous parsing operation on a specified source file,
 * transforming its content into a structured data representation.
 *
 * This function handles file system interactions and delegates the
 * actual parsing logic to an internal utility. It includes robust
 * path resolution, accessibility checks, and error handling for file operations.
 *
 * @param {string} sourcePath       - The absolute or relative path to the input file.
 * @param {object} [processingConfig={}] - Configuration parameters influencing the parsing process.
 *                                        If not provided, an empty object will be used.
 * @returns {object|string} The result of the parsing operation, typically a JSON object
 *                          or a string representation if specified by configuration.
 * @throws {Error} If the provided sourcePath is invalid, the file cannot be accessed,
 *                 or an error occurs during file reading.
 */
module.exports = function(sourcePath, processingConfig) {

  // --- Input Validation and Initialization ---

  if (typeof sourcePath !== 'string' || sourcePath.trim().length === 0) {
    console.error("Processing Error: Supplied 'sourcePath' must be a non-empty string.");
    throw new Error("Invalid source path provided for processing.");
  }

  // Ensure configuration object is always available, even if caller omits it.
  const currentConfig = processingConfig || {};

  // --- Path Resolution and Accessibility Checks ---

  let resolvedFilePath;
  try {
    // Resolve the real path to handle symlinks, relative paths, and ensure existence.
    resolvedFilePath = fileSystemOps.realpathSync(sourcePath);
    // console.debug(`Successfully resolved path '${sourcePath}' to '${resolvedFilePath}'.`);
  } catch (pathResolutionError) {
    console.error(`Processing Error: Failed to resolve the real path for '${sourcePath}'. Details: ${pathResolutionError.message}`);
    throw new Error(`Could not resolve file path: ${sourcePath}`);
  }

  try {
    // Verify that the resolved file path points to a readable file.
    fileSystemOps.accessSync(resolvedFilePath, fileSystemOps.constants.R_OK);
    // console.debug(`File '${resolvedFilePath}' is accessible for reading.`);
  } catch (fileAccessError) {
    console.error(`Processing Error: File '${resolvedFilePath}' is not readable or does not exist. Details: ${fileAccessError.message}`);
    throw new Error(`File not readable or does not exist: ${resolvedFilePath}`);
  }

  // --- File Content Reading ---

  let fileContentBuffer;
  try {
    // Read the entire content of the file into a buffer synchronously.
    // No specific encoding is provided here, as the downstream parser might handle it.
    fileContentBuffer = fileSystemOps.readFileSync(resolvedFilePath);
    // console.debug(`Successfully read ${fileContentBuffer.byteLength} bytes from '${resolvedFilePath}'.`);
  } catch (fileReadError) {
    console.error(`Processing Error: Failed to read file content from '${resolvedFilePath}'. Details: ${fileReadError.message}`);
    throw new Error(`Error reading file content: ${resolvedFilePath}`);
  }

  // --- Delegation to Core Parsing Logic ---

  // Load the dedicated parsing utility dynamically.
  // This approach allows for easier mocking in tests and clearer separation.
  const contentParserUtility = require("./parse");

  // Execute the core parsing function with the obtained file content and user-defined configuration.
  const finalParsedOutput = contentParserUtility(fileContentBuffer, currentConfig);

  // console.info(`Parsing operation completed for '${resolvedFilePath}'.`);

  return finalParsedOutput;
};