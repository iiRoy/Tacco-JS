// Function to process and analyze textual data from a source.
function handleIncomingText(rawTextContent) {
  // Ensure the raw input string is not null or undefined.
  if (!rawTextContent) {
    console.error("Error: No input content provided for processing.");
    return; // Exit if no content
  }

  // Trim any leading/trailing whitespace from the entire input block.
  // Then, break the content into individual lines using the newline character.
  let contentLines = rawTextContent.trim().split('\n');

  // If after trimming and splitting, we have no lines,
  // or only a single line (which is typically a header/count and not data),
  // there's no actual data to process beyond the potential header.
  if (contentLines.length <= 1) {
    console.log("No valid data lines found after initial parsing or header removal.");
    return;
  }

  // The problem statement implies the first line is often metadata (e.g., a count of items).
  // We'll extract the actual data lines by creating a new array that skips the first entry.
  // Using slice(1) creates a new array without modifying the original `contentLines`.
  let dataSegments = contentLines.slice(1);

  // After removing the first line, if the remaining data segments array is empty,
  // it means there's nothing left to compare or output.
  if (dataSegments.length === 0) {
    console.log("No data elements remaining for comparison after header removal.");
    return;
  }

  // Initialize a variable to hold the lexicographically smallest string found so far.
  // We start with the first element of the `dataSegments` array as our initial candidate.
  let currentSmallestItem = dataSegments[0];

  // Iterate through the remaining data segments to find the smallest one.
  // We start from the second element (index 1) because the first is already our initial candidate.
  for (let i = 1; i < dataSegments.length; i++) {
    const currentItem = dataSegments[i];

    // Compare the current item from the loop with our current smallest candidate.
    // The `localeCompare` method returns:
    // - a negative number if `currentItem` comes before `currentSmallestItem` lexicographically.
    // - a positive number if `currentItem` comes after `currentSmallestItem`.
    // - 0 if they are equivalent.
    if (currentItem.localeCompare(currentSmallestItem) < 0) {
      currentSmallestItem = currentItem; // Update if a new, smaller item is found
    }
  }

  // Output the final determined lexicographically smallest item to the console.
  console.log(currentSmallestItem);
}

// --- Utility function for reading standard input ---
// This function encapsulates the input/output operation, making the main processing logic cleaner.
function obtainStandardInput() {
  try {
    // Attempt to read the entire content from standard input synchronously.
    // The content is decoded as UTF-8 to handle various character sets.
    return require("fs").readFileSync("/dev/stdin", "utf8");
  } catch (error) {
    // If an error occurs during file reading (e.g., file not found, permission issues),
    // log the error and return null to indicate failure.
    console.error("Failed to read from standard input stream:", error.message);
    return null; // Return null on error, which `handleIncomingText` will gracefully manage.
  }
}

// Execute the main processing logic using data obtained from the standard input stream.
handleIncomingText(obtainStandardInput());