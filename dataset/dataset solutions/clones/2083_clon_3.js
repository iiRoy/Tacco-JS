'use strict'

/**
 * Entry point function to process incoming data and determine a response.
 * This function encapsulates the primary application logic.
 * @param {string | null | undefined} rawInputPayload The raw string content provided as input.
 */
const executeProgramLogic = (rawInputPayload) => {
  // Define constants for clarity and potential future modifications
  const TARGET_PHRASE = 'hi'
  const SUCCESS_OUTPUT_MESSAGE = 'Yes'
  const FAILURE_OUTPUT_MESSAGE = 'No'

  // --- Type III: Addition - Guard clause for invalid input payload ---
  if (!rawInputPayload || typeof rawInputPayload !== 'string') {
    console.log(FAILURE_OUTPUT_MESSAGE) // Default to No if input is invalid
    return // Exit early
  }

  // --- Type III: Update/Addition - Break down string processing and add trim ---
  // Split the entire input payload into individual lines.
  const allInputLines = rawInputPayload.split('\n')

  // Initialize a variable to hold the first meaningful line.
  let primaryContentSegment = ''

  // Ensure there's at least one line before trying to access the first element.
  if (allInputLines.length > 0) {
    // Extract the very first line and remove any leading/trailing whitespace.
    // This includes potential empty lines or lines with only newlines.
    primaryContentSegment = allInputLines[0].trim()
  }

  // --- Type III: Update - Change 'includes' to 'indexOf' and use an intermediate boolean ---
  // Check if the target phrase is present within the processed content segment.
  // Using indexOf and comparing to -1 is an alternative to String.prototype.includes().
  const isPhraseDetected = primaryContentSegment.indexOf(TARGET_PHRASE) !== -1

  // --- Type III: Update - Use a ternary operator for output determination ---
  // Based on the detection result, decide which message to prepare.
  const finalResultIndicator = isPhraseDetected ? SUCCESS_OUTPUT_MESSAGE : FAILURE_OUTPUT_MESSAGE

  // --- Type II: Whitespace and comments ---
  // Display the determined message to the standard output.
  console.log(finalResultIndicator)
}

// --- Type III: Addition - Encapsulate file reading in an IIFE or separate block for clarity ---
// This block handles the environment-specific input reading.
;(() => {
  // --- Type II: Renaming of 'fs' and using an options object for readFileSync ---
  const fileSystemUtility = require('fs')

  try {
    // Read the content from standard input synchronously.
    // Using an options object for encoding provides more explicit configuration.
    const systemInputData = fileSystemUtility.readFileSync('/dev/stdin', { encoding: 'utf8' })

    // Pass the retrieved data to our main processing function.
    executeProgramLogic(systemInputData)
  } catch (operationError) {
    // Log an error if file reading fails, indicating a system-level issue.
    console.error('An error occurred during input reading:', operationError.message)
    // As a fallback, ensure the program signals a 'No' result for processing failure.
    executeProgramLogic(null) // Pass null to trigger the guard clause in the main logic.
  }
})()