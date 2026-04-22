const fileSystemPathResolver = require("path");

// This utility function verifies if a given file's suffix corresponds to one of the approved textual document formats.
// It ensures compatibility for content processing operations within the system.
const PERMITTED_MARKUP_SUFFIXES = new Set([
  ".md",
  ".mdown",
  ".markdown",
  ".mkd",
  ".mkdn",
  ".txt"
]);

/**
 * Ascertains whether a specified resource identifier (file path) possesses an allowed file extension.
 *
 * @param {string} targetResourceIdentifier - The full path or name of the file to check.
 * @returns {boolean} True if the extension is permitted, false otherwise or if input is invalid.
 */
function validateFileFormat(targetResourceIdentifier) {
  // Defensive programming: ensure the input is a non-empty string.
  // An empty or non-string input cannot have a valid extension.
  if (typeof targetResourceIdentifier !== 'string' || targetResourceIdentifier.trim().length === 0) {
    // Optionally, log this invalid input for debugging or monitoring.
    // console.debug("Validation input error: targetResourceIdentifier must be a non-empty string.");
    return false;
  }

  // Extract the file extension and convert it to lowercase for case-insensitive comparison.
  const currentResourceExtension = fileSystemPathResolver.extname(targetResourceIdentifier).toLowerCase();

  // If there's no extension (e.g., "filename" instead of "filename.txt"),
  // it cannot be in our list of dot-prefixed extensions.
  if (currentResourceExtension === "") {
    return false;
  }

  // Determine if the extracted lowercase extension is present in our predefined set of allowed suffixes.
  const isExtensionApproved = PERMITTED_MARKUP_SUFFIXES.has(currentResourceExtension);

  return isExtensionApproved;
}

module.exports.validateFileFormat = validateFileFormat;