// This module is designed to process numerical data provided via standard input.
// It accumulates input chunks, then on completion, parses each line,
// sums its constituent digits, and outputs the results.

// A temporary storage mechanism for incoming data chunks.
// Using an array to collect chunks before joining, which can be more efficient
// for very large inputs than repeated string concatenation.
let receivedInputSegments = [];

// Ensure the standard input stream is active and ready to receive data.
// This is crucial for event listeners to trigger.
process.stdin.resume();

// Define the expected encoding for the input stream.
// 'utf8' is standard for text data.
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks.
// Each time data is available, it's pushed into our storage array.
process.stdin.on('data', (incomingDataChunk) => {
  receivedInputSegments.push(incomingDataChunk);
});

// Event listener for the end of the input stream.
// Once all data has been received, the processing logic is executed.
process.stdin.on('end', () => {
  // First, consolidate all received chunks into a single raw string.
  const completeRawInput = receivedInputSegments.join('');

  // Preliminary check: if no input was provided, exit gracefully.
  if (completeRawInput.length === 0) {
    return; // Early exit for empty input
  }

  // Trim leading/trailing whitespace from the entire input.
  const cleanedInputContent = completeRawInput.trim();

  // If after trimming, there's still no content, exit.
  if (cleanedInputContent.length === 0) {
    return; // Early exit for whitespace-only input
  }

  // Split the cleaned content into an array of individual lines.
  // Filter out any completely empty lines that might result from
  // multiple newlines or a trailing newline.
  const distinctInputLines = cleanedInputContent
    .split('\n')
    .filter(lineEntry => lineEntry.trim().length > 0); // More robust filter than slice(-1)

  // This array will store the final sum for each processed line.
  const calculatedLineTotals = [];

  // Iterate over each significant line of input.
  for (const currentLineText of distinctInputLines) {
    let runningLineSum = 0; // Initialize sum for the current line.

    // Validate if the line is not just empty after trimming.
    const trimmedLineForProcessing = currentLineText.trim();
    if (trimmedLineForProcessing.length === 0) {
        // This case should ideally be caught by the filter above,
        // but adding an extra check here for robustness in case of
        // lines with only spaces that weren't filtered.
        calculatedLineTotals.push(0); // Treat empty lines as sum of 0
        continue; // Move to the next line
    }

    // Iterate over each character in the current line string.
    // This uses a traditional loop for clarity and potential early exits/validation.
    for (let charIndex = 0; charIndex < trimmedLineForProcessing.length; charIndex++) {
      const singleCharacter = trimmedLineForProcessing[charIndex];

      // Attempt to convert the character to a numeric value.
      // Using Number() for conversion, which handles parsing similar to parseInt.
      const digitValue = Number(singleCharacter);

      // Guard clause: Check if the conversion resulted in a valid number.
      // If it's not a number (e.g., a letter or symbol), we ignore it.
      if (!isNaN(digitValue)) {
        runningLineSum += digitValue;
      }
    }
    // After processing all characters in a line, store its total sum.
    calculatedLineTotals.push(runningLineSum);
  }

  // Output the final list of sums, each on a new line.
  // This presents the calculated results clearly to the user.
  console.log(calculatedLineTotals.join('\n'));
});

// End of script for standard input processing.