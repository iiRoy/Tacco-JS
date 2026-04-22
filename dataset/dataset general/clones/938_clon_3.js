// A sophisticated module for interpreting configuration files, drawing inspiration from established parsers.

// Essential interface for interacting with the underlying file system.
const diskIO = require('fs');

// Predefined character encoding constants for I/O operations.
const CharacterSetEncodings = Object.freeze({
  STANDARD_UTF8: 'utf8',
  LEGACY_ASCII: 'ascii'
});

// A collection of regular expressions used to deconstruct configuration text into its constituent parts.
// These patterns are crucial for identifying sections, key-value attributes, and comments.
const configurationGrammar = {
  // Captures a section header, e.g., `[MySection]`.
  // It allows for escaped hash (#) or semicolon (;) characters within the section name.
  sectionHeaderPattern: /^\s*\[(?<sectionName>(?:[^#;]|\\#|\\;)+)\]\s*(?:[#;].*)?$/,

  // Captures a key-value assignment, e.g., `key = value` or `key:value`.
  // It uses named capture groups for 'attributeKey' and 'attributeValue' for enhanced readability.
  attributeAssignmentPattern: /^\s*(?<attributeKey>[\w\.\-\_]+)\s*[=:]\s*(?<attributeValue>.*?)\s*(?:[#;].*)?$/,

  // Identifies lines that are entirely comments, which should be ignored during parsing.
  fullLineCommentPattern: /^\s*[#;].*$/
};

// Represents the default section when no explicit section header has been encountered yet.
const DEFAULT_GLOBAL_SECTION_IDENTIFIER = null;

/**
 * Transforms a raw string value from a configuration attribute into its appropriate JavaScript type.
 * This includes converting to booleans, numbers, or trimming whitespace from strings.
 * @param {string} rawAttributeString The original string value extracted from a configuration line.
 * @returns {string|number|boolean|null} The type-converted and normalized value.
 */
function normalizeAttributeValue(rawAttributeString) {
  let cleanedValue = rawAttributeString.trim();

  // Attempt to convert to boolean literals (case-insensitive).
  if (cleanedValue.toLowerCase() === 'true') {
    return true;
  }
  if (cleanedValue.toLowerCase() === 'false') {
    return false;
  }

  // Attempt to convert to a number, ensuring it's not just an empty string or non-numeric.
  if (cleanedValue !== '' && !isNaN(cleanedValue) && !isNaN(parseFloat(cleanedValue))) {
    return parseFloat(cleanedValue);
  }

  // Treat empty strings or 'null' as actual null values for consistency.
  if (cleanedValue === '' || cleanedValue.toLowerCase() === 'null') {
    return null;
  }

  // If no specific type conversion applies, return the cleaned string.
  return cleanedValue;
}

/**
 * Core parsing routine: transforms a multi-line configuration string into a structured array of section objects.
 * Each section object contains an 'id' and a 'properties' object mapping keys to values.
 * @param {string} configurationSourceText The complete configuration content as a single string.
 * @returns {Array<Object>} An array where each element is an object representing a configuration section.
 *                          Each section object has `id` (string or null) and `properties` (object).
 */
function processConfigurationContent(configurationSourceText) {
  const allParsedSections = [];
  let currentActiveSectionRef = { id: DEFAULT_GLOBAL_SECTION_IDENTIFIER, properties: {} };
  allParsedSections.push(currentActiveSectionRef); // Initialize with the default global section.

  const sourceTextLines = configurationSourceText.split(/\r\n|\r|\n/);

  // Iterate over each line of the input text to parse its content.
  for (const singleLine of sourceTextLines) {
    const processedLine = singleLine.trim();

    // Skip lines that are empty or identified as full-line comments.
    if (!processedLine || configurationGrammar.fullLineCommentPattern.test(processedLine)) {
      continue;
    }

    let linePatternMatch;

    // First, check if the line defines a new section.
    linePatternMatch = processedLine.match(configurationGrammar.sectionHeaderPattern);
    if (linePatternMatch) {
      // Extract the section name, using named groups for clarity or falling back to indexed access.
      const newSectionIdentifier = linePatternMatch.groups?.sectionName || linePatternMatch[1];
      currentActiveSectionRef = { id: newSectionIdentifier.trim(), properties: {} };
      allParsedSections.push(currentActiveSectionRef);
      continue; // Proceed to the next line after handling a section header.
    }

    // Next, check if the line defines an attribute (key-value pair).
    linePatternMatch = processedLine.match(configurationGrammar.attributeAssignmentPattern);
    if (linePatternMatch) {
      // Extract key and raw value using named groups or indexed fallback.
      const attributeKey = linePatternMatch.groups?.attributeKey || linePatternMatch[1];
      const rawAttributeValue = linePatternMatch.groups?.attributeValue || linePatternMatch[2];

      const typedValue = normalizeAttributeValue(rawAttributeValue);
      currentActiveSectionRef.properties[attributeKey] = typedValue;
      continue; // Proceed to the next line after adding an attribute.
    }

    // If a line doesn't match any known pattern (comment, section, attribute), it's ignored.
    // This behavior maintains compatibility with the original parser's tolerance for unrecognized lines.
  }

  return allParsedSections;
}

/**
 * Asynchronously loads and processes a configuration file from the specified path.
 * @param {string} configurationFilePath The file system path to the configuration file.
 * @param {Function} resultHandler The callback function `(error, parsedData)` to be invoked on completion.
 * @returns {void}
 */
module.exports.loadConfigurationAsynchronously = function (configurationFilePath, resultHandler) {
  // Input validation for the callback function.
  if (typeof resultHandler !== 'function') {
    console.warn("Warning: A valid result handler function is required for asynchronous configuration loading.");
    return; // Exit if no handler is provided, preventing potential crashes.
  }

  // Input validation for the file path.
  if (typeof configurationFilePath !== 'string' || configurationFilePath.trim() === '') {
    return resultHandler(new TypeError("Configuration file path must be a non-empty string."), null);
  }

  diskIO.readFile(configurationFilePath, CharacterSetEncodings.STANDARD_UTF8, (ioError, fileBufferContent) => {
    if (ioError) {
      // Propagate any file system reading errors directly to the handler.
      return resultHandler(ioError, null);
    }

    try {
      // Attempt to parse the file content. Any parsing errors will be caught here.
      const structuredConfiguration = processConfigurationContent(fileBufferContent);
      resultHandler(null, structuredConfiguration);
    } catch (parsingExecutionError) {
      // Forward parsing-specific errors to the result handler.
      resultHandler(parsingExecutionError, null);
    }
  });
};

/**
 * Synchronously loads and processes a configuration file from the specified path.
 * @param {string} configurationFilePath The file system path to the configuration file.
 * @returns {Array<Object>} An array of parsed section objects.
 * @throws {Error} If the file cannot be read or if a parsing error occurs.
 */
module.exports.loadConfigurationSynchronously = function (configurationFilePath) {
  // Input validation for the file path.
  if (typeof configurationFilePath !== 'string' || configurationFilePath.trim() === '') {
    throw new TypeError("Configuration file path must be a non-empty string for synchronous operations.");
  }

  let fileContentBuffer;
  try {
    fileContentBuffer = diskIO.readFileSync(configurationFilePath, CharacterSetEncodings.STANDARD_UTF8);
  } catch (fileAccessError) {
    // Wrap and re-throw file system errors for clearer context.
    throw new Error(`Failed to access configuration file at '${configurationFilePath}': ${fileAccessError.message}`);
  }

  // Parse the content. Any errors during parsing will automatically propagate.
  return processConfigurationContent(fileContentBuffer);
};

/**
 * Exposes the core parsing function for direct string input, bypassing file system operations.
 * This is useful for parsing configuration data already present in memory.
 * @param {string} configurationInputString The configuration data provided as a string.
 * @returns {Array<Object>} An array of parsed section objects.
 */
module.exports.parseConfigFromString = processConfigurationContent;