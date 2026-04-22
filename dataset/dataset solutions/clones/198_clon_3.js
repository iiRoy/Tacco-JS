function processPatientData() {
  // Define the set of valid blood types for robust processing and validation.
  // This constant also serves as a reference for initializing our frequency counter.
  const recognizedBloodCategories = ['A', 'B', 'AB', 'O'];

  // Initialize an object to store the frequency of each recognized blood type.
  // Each category starts with a count of zero.
  const bloodTypeTally = {};
  for (const category of recognizedBloodCategories) {
    bloodTypeTally[category] = 0;
  }

  // Perform initial processing on the raw input data stream:
  // 1. Split the entire collected string by newline characters into individual lines.
  // 2. Trim leading/trailing whitespace from each line to clean up the data.
  // 3. Filter out any lines that become empty after trimming, ignoring blank entries.
  const cleanInputLines = accumulatedStreamData
    .split('\n')
    .map(dataLine => dataLine.trim())
    .filter(trimmedLine => trimmedLine.length > 0);

  // Iterate over each validated and cleaned input line to update the blood type counts.
  for (const currentLine of cleanInputLines) {
    // Attempt to parse the line, expecting a comma-separated value (CSV-like format).
    const lineSegments = currentLine.split(',');

    // Implement a guard clause to ensure the line has at least two parts
    // (e.g., "PatientName,BloodType") and that the second part is not empty.
    if (lineSegments.length < 2 || !lineSegments[1] || lineSegments[1].trim() === '') {
      // If the line is malformed or lacks a blood type, skip to the next entry.
      // A more complex application might log a warning here.
      continue;
    }

    // Extract the potential blood type identifier from the second segment, trimming it.
    const extractedBloodType = lineSegments[1].trim();

    // Validate the extracted blood type against our list of recognized categories.
    // This prevents errors from unexpected or invalid input values.
    if (recognizedBloodCategories.includes(extractedBloodType)) {
      // Use a switch statement for clarity when incrementing counts.
      // This also allows for specific actions per type if needed in the future.
      switch (extractedBloodType) {
        case 'A':
          bloodTypeTally.A++;
          break;
        case 'B':
          bloodTypeTally.B++;
          break;
        case 'AB':
          bloodTypeTally.AB++;
          break;
        case 'O':
          bloodTypeTally.O++;
          break;
        // The 'default' case should ideally not be reached due to the 'includes' check,
        // but it's good practice for robustness in a switch statement.
        default:
          // console.error(`Logic error: Unhandled recognized type: ${extractedBloodType}`);
          break;
      }
    } else {
      // Log or handle cases where an unrecognized blood type is encountered.
      // console.warn(`Discarding entry with unrecognized blood type: "${extractedBloodType}" in line: "${currentLine}"`);
    }
  }

  // Construct the final output string, presenting the tallied blood type frequencies.
  // Using template literals for a clean, multi-line report format.
  const finalSummaryReport = `
--- Blood Type Analysis Results ---
  Count for Type A:  ${bloodTypeTally.A}
  Count for Type B:  ${bloodTypeTally.B}
  Count for Type AB: ${bloodTypeTally.AB}
  Count for Type O:  ${bloodTypeTally.O}
-----------------------------------
`;

  // Output the generated report to the console.
  console.log(finalSummaryReport.trim());
}

// A global mutable variable to accumulate all incoming data chunks from standard input.
let accumulatedStreamData = '';

// Configure and manage the standard input stream to collect user-provided data.

// Ensure the standard input stream is active and ready to receive data.
process.stdin.resume();

// Specify 'utf8' as the character encoding for incoming data chunks.
process.stdin.setEncoding('utf8');

// Attach an event listener for 'data' events.
// Each time a piece of data ('dataChunk') arrives, append it to our buffer.
process.stdin.on('data', function(dataChunk) {
  accumulatedStreamData += dataChunk;
});

// Attach an event listener for the 'end' event.
// This signifies that all input has been received.
process.stdin.on('end', function() {
  // Once the input stream has concluded, initiate the data processing logic.
  processPatientData();
});