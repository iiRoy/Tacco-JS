function determineSuffix(initialPayload) {
  // Ensure the input is treated as a string, handling null/undefined payloads gracefully
  // and removing any leading or trailing whitespace for consistent processing.
  const processedInputString = String(initialPayload || '').trim();

  // Implement a guard clause: If the input string becomes empty after trimming,
  // we'll output a default designation and terminate the function early.
  if (processedInputString.length === 0) {
    console.log("bon"); // This is the designated output for an empty or invalid primary input.
    return;
  }

  // Extract the very last character from the cleaned input string.
  // Using String.prototype.slice(-1) is an efficient and concise method
  // to retrieve the final character without splitting the entire string.
  const terminalCharacter = processedInputString.slice(-1);

  // Initialize a mutable variable to hold the final designation that will be printed.
  let outputDesignation = '';

  // To replace the original chained OR conditions, we utilize Set objects.
  // Sets provide efficient O(1) average-time complexity for membership checks,
  // making the categorization logic clearer and potentially faster for larger character sets.
  const honDigits = new Set(['2', '4', '5', '7', '9']); // Characters leading to "hon"
  const ponDigits = new Set(['0', '1', '6', '8']);     // Characters leading to "pon"

  // Now, determine the appropriate designation based on which category the terminal character falls into.
  if (honDigits.has(terminalCharacter)) {
    // If the terminal character is found within the 'hon' category set.
    outputDesignation = "hon";
  } else if (ponDigits.has(terminalCharacter)) {
    // If the terminal character is found within the 'pon' category set.
    outputDesignation = "pon";
  } else {
    // This 'else' block serves as the default case. It implicitly handles the character '3'
    // and also acts as a catch-all for any other unexpected characters that might appear.
    outputDesignation = "bon";
  }

  // Finally, display the determined suffix to the standard output.
  console.log(outputDesignation);
}

// This execution block is responsible for acquiring data from standard input
// and then passing it to our primary processing function.
// It includes robust error handling for file system operations.
try {
  // Dynamically import the Node.js file system module.
  const fileSystemUtility = require("fs");

  // Define the standard input device path, which is common in Unix-like systems.
  const standardInputDevicePath = "/dev/stdin";

  // Specify the character encoding for reading the input file content.
  const characterEncodingFormat = "utf8";

  // Synchronously read the entire content from the standard input device.
  // This blocks execution until the input is fully read.
  const rawFileContent = fileSystemUtility.readFileSync(standardInputDevicePath, characterEncodingFormat);

  // Invoke our main logic function with the content obtained from stdin.
  determineSuffix(rawFileContent);
} catch (inputReadingError) {
  // If any error occurs during the process of reading from standard input
  // (e.g., file not found, permission denied, invalid path), catch it here.
  console.error("An exceptional condition occurred while attempting to read data from standard input:", inputReadingError.message);
  // In a production scenario, one might choose to:
  // 1. Exit the process with an error code: process.exit(1);
  // 2. Call determineSuffix with a default/fallback value: determineSuffix("3");
  // For this example, we simply log the error and allow the program to terminate naturally.
}