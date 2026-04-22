"use strict"; // Enforce strict JavaScript parsing and execution rules.

/*
 * This foundational utility module provides a collection of functions
 * designed to assist with common programming tasks, including string
 * sanitization, object manipulation, and source code processing.
 * It serves as a core toolkit for various application layers.
 */
const utilityToolkit = {}; // Create an object to house all our utility methods.
module.exports = utilityToolkit; // Export this object to make it accessible to other modules.

/**
 * Sanitizes a given string by escaping characters that have special meaning
 * within regular expressions. This makes the string safe to be used as
 * a literal pattern in a regex.
 *
 * @param {string} rawInput - The string content to be sanitized.
 * @returns {string} The input string with all regex special characters escaped.
 *                    Returns an empty string if input is null/undefined.
 */
utilityToolkit.sanitizeForRegex = function (rawInput) {
  // A constant regular expression to identify all characters
  // that need escaping in a regex pattern. The hyphen is
  // placed last in the character set to be treated literally.
  const REGEX_META_CHARS_PATTERN = /[\[\]{}()*+?.,\\^$|#\s-]/g;

  // Ensure the input is always treated as a string.
  // If `rawInput` is null or undefined, it becomes an empty string.
  const normalizedString = String(rawInput || '');

  // Perform the replacement, prepending a backslash to each matched character.
  return normalizedString.replace(REGEX_META_CHARS_PATTERN, "\\$&");
};

/**
 * Merges properties from one or more source objects into a target object.
 * This function performs a shallow copy; nested objects are copied by reference.
 * It directly modifies the `primaryRecipient` object.
 *
 * @param {object} primaryRecipient - The object that will receive merged properties.
 * @param {...object} contributingSources - A variable number of source objects
 *                                          whose enumerable own properties will be copied.
 * @returns {object} The `primaryRecipient` object after all properties have been merged.
 * @throws {TypeError} If `primaryRecipient` is not a non-null, non-array object.
 */
utilityToolkit.assignProperties = function (primaryRecipient, ...contributingSources) {
  // Validate that the primary recipient is a suitable object for merging.
  // It must be an object, not null, and not an array.
  if (typeof primaryRecipient !== 'object' || primaryRecipient === null || Array.isArray(primaryRecipient)) {
    throw new TypeError('The primary recipient must be a valid, non-array object for property assignment.');
  }

  // Iterate over each source provided in the `contributingSources` array.
  for (const currentSource of contributingSources) {
    // Only attempt to merge from valid object sources.
    // Skip null, undefined, or non-object types (including arrays).
    if (typeof currentSource === 'object' && currentSource !== null && !Array.isArray(currentSource)) {
      // Use `Object.keys` to get only the enumerable own property names of the source.
      // This prevents iterating over inherited properties or non-enumerable ones.
      Object.keys(currentSource).forEach(propertyName => {
        // Assign the property value from the current source to the primary recipient.
        primaryRecipient[propertyName] = currentSource[propertyName];
      });
    }
  }

  // Return the modified primary recipient object.
  return primaryRecipient;
};

/**
 * Removes both multi-line (/* ... */) and single-line (// ...) comments
 * from a string containing source code.
 *
 * @param {string} codeContent - The string of code from which comments should be stripped.
 * @returns {string} The code string with all detected comments removed.
 *                    Returns an empty string if input is null/undefined.
 */
utilityToolkit.stripCodeComments = function (codeContent) {
  // Regex for matching C-style block comments.
  // `[\s\S]*?` matches any character including newlines, non-greedily.
  const BLOCK_COMMENT_REGEX = /\/\*[\s\S]*?\*\//g;

  // Regex for matching C++-style line comments.
  // `\s*` allows for optional whitespace after `//`.
  // `.*?` matches any characters non-greedily up to a newline or end of string.
  const LINE_COMMENT_REGEX = /\/\/\s*.*?(?=\n|$)/g;

  // Ensure the input is a string, handling null/undefined by converting to empty string.
  let cleanedCode = String(codeContent || '');

  // First, remove all block comments.
  // This is often done first to prevent `//` inside a block comment from being misinterpreted.
  cleanedCode = cleanedCode.replace(BLOCK_COMMENT_REGEX, '');

  // Then, remove all line comments.
  cleanedCode = cleanedCode.replace(LINE_COMMENT_REGEX, '');

  return cleanedCode;
};

/**
 * Processes a multi-line string, filtering out any lines that begin with a
 * predefined "directive" comment prefix (e.g., `//!`). It also attempts to
 * normalize resulting empty lines.
 *
 * @param {string} inputData - The raw string data, potentially containing directive lines.
 * @returns {string} The processed string with all directive lines removed,
 *                    and leading/trailing whitespace trimmed from the overall result.
 *                    Returns an empty string for invalid or empty input.
 */
utilityToolkit.filterOutDirectiveLines = function (inputData) {
  // Define the specific string that identifies a directive line.
  const DIRECTIVE_PREFIX_MARKER = '//!';

  // Perform early exit for invalid or empty input to prevent unnecessary processing.
  if (typeof inputData !== 'string' || inputData.length === 0) {
    return '';
  }

  // Split the entire input content into an array of individual lines.
  const allSourceLines = inputData.split('\n');
  const resultingFilteredLines = []; // This array will store the lines that pass our filter.
  let consecutiveEmptyLines = 0; // Tracks consecutive empty lines for cleanup.

  // Manually iterate through each line to apply custom filtering logic.
  for (let lineIndex = 0; lineIndex < allSourceLines.length; lineIndex++) {
    const currentRawLine = allSourceLines[lineIndex];
    const trimmedCurrentLine = currentRawLine.trim(); // Trim for comparison, but keep raw line for output.

    // Check if the trimmed line starts with our directive marker.
    if (trimmedCurrentLine.startsWith(DIRECTIVE_PREFIX_MARKER)) {
      // If it's a directive line, skip it and do not add to results.
      continue;
    }

    // If the line is empty after trimming, increment the counter.
    if (trimmedCurrentLine.length === 0) {
      consecutiveEmptyLines++;
    } else {
      // If a non-empty line is found after one or more empty lines,
      // add at most one empty line to preserve some spacing.
      if (consecutiveEmptyLines > 0 && resultingFilteredLines.length > 0) {
        resultingFilteredLines.push('');
      }
      consecutiveEmptyLines = 0; // Reset counter for non-empty lines.
      resultingFilteredLines.push(currentRawLine); // Add the original line (untrimmed) to the results.
    }
  }

  // After the loop, if there were trailing empty lines, add at most one
  // to maintain a single trailing newline if appropriate.
  if (consecutiveEmptyLines > 0 && resultingFilteredLines.length > 0) {
    resultingFilteredLines.push('');
  }

  // Join the filtered lines back into a single string,
  // and then trim any leading or trailing whitespace from the final output.
  return resultingFilteredLines.join('\n').trim();
};