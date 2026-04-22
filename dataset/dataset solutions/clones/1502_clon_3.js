const SUFFIX_FOR_S_END = "es";
const DEFAULT_PLURAL_SUFFIX = "s";

/**
 * Determines the plural form of a single term based on a simplified rule.
 * Specifically, if the term ends with 's', it appends 'es'; otherwise, it appends 's'.
 * This logic does not account for complex English pluralization rules.
 * @param {string} singularWord The word to pluralize.
 * @returns {string} The pluralized form of the word, or the original word if invalid input.
 */
function getPluralizedTerm(singularWord) {
  // Validate input to ensure it's a non-empty string.
  if (typeof singularWord !== 'string' || singularWord.trim().length === 0) {
    return singularWord; // Return as-is for invalid or empty input
  }

  // Regex to detect if the word's final character is 's'.
  const endsWithSDetector = /s$/;

  let pluralizedResult;

  // Apply the specific pluralization rule.
  if (endsWithSDetector.test(singularWord)) {
    pluralizedResult = singularWord + SUFFIX_FOR_S_END;
  } else {
    pluralizedResult = singularWord + DEFAULT_PLURAL_SUFFIX;
  }

  return pluralizedResult;
}

/**
 * Processes raw multi-line input data, applying a pluralization rule to each valid line,
 * and then outputs the collected results.
 * @param {string} rawInputContent The raw string content, expected to be newline-separated.
 */
function processInputData(rawInputContent) {
  // Guard clause for empty or invalid input content.
  if (!rawInputContent || typeof rawInputContent !== 'string' || rawInputContent.trim().length === 0) {
    return; // No processing needed for empty input.
  }

  // Split the input into individual lines and filter out any entirely empty segments.
  const inputLineFragments = rawInputContent
                                .split('\n')
                                .filter(segment => segment.trim().length > 0);

  const processedOutputs = []; // Collect all pluralized terms here.

  // Iterate over each significant line fragment.
  for (const currentLine of inputLineFragments) {
    const trimmedLine = currentLine.trim();

    // Ensure the line is not just whitespace after trimming.
    if (trimmedLine.length > 0) {
      const pluralForm = getPluralizedTerm(trimmedLine);
      processedOutputs.push(pluralForm);
    }
  }

  // Output all collected results to the console.
  processedOutputs.forEach(outputString => console.log(outputString));
}

/**
 * Safely reads content from a specified file path using Node.js 'fs' module.
 * @param {string} filePath The path to the file to read.
 * @returns {string | null} The file content as a UTF-8 string, or null if an error occurs during reading.
 */
function safelyReadInputFile(filePath) {
  const fileSystemModule = require("fs");
  let fileContent = null;
  try {
    fileContent = fileSystemModule.readFileSync(filePath, { encoding: "utf8" });
  } catch (readError) {
    console.error(`An error occurred while attempting to read the file at ${filePath}:`, readError.message);
    // Optionally, re-throw the error or handle it differently based on application needs.
  }
  return fileContent;
}

// Main execution block: read input from standard input and process it.
const scriptInputData = safelyReadInputFile("/dev/stdin");

// Proceed only if valid data was successfully read from the input source.
if (scriptInputData !== null) {
  processInputData(scriptInputData);
}
// If scriptInputData is null, an error message would have been logged by safelyReadInputFile,
// and processInputData will gracefully exit if called with null/empty,
// so no explicit 'else' block is strictly necessary here.