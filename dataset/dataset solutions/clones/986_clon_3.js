/*
 * This script is designed to process raw input content, specifically
 * to parse a sequence of numbers and then sort them using an insertion sort algorithm.
 * It provides detailed output, showing the state of the array after each significant
 * insertion step.
 */
function ProcessInputData(sourceContent) {
  // Validate the initial input: ensure it's not null, undefined, or an empty string.
  if (!sourceContent || typeof sourceContent !== 'string' || sourceContent.trim() === '') {
    console.error("Error: Provided input content is either invalid, empty, or not a string.");
    return; // Terminate execution if input is unusable.
  }

  // Split the entire input string into individual lines based on the newline character.
  const linesOfText = sourceContent.split("\n");

  // A robust check to ensure that we have at least two lines: one for the count
  // and one for the space-separated numeric sequence.
  if (linesOfText.length < 2) {
    console.error("Error: Insufficient input lines. Expected at least two lines (count and data).");
    return;
  }

  // Attempt to parse the first line as an integer representing the total number of items.
  // .trim() is used to remove any leading/trailing whitespace.
  const totalItems = parseInt(linesOfText[0].trim(), 10);

  // Validate the parsed totalItems. It must be a non-negative integer.
  if (isNaN(totalItems) || totalItems < 0) {
    console.error(`Error: The specified item count '${linesOfText[0]}' is invalid. It must be a non-negative integer.`);
    return;
  }

  // Process the second line to extract the numeric data.
  // It splits the string by spaces, converts each part to a number,
  // and filters out any elements that are not valid numbers (e.g., empty strings or non-numeric text).
  const dataCollection = linesOfText[1].split(" ").map(elementStr => {
    const numVal = Number(elementStr); // Convert string part to a number.
    return isNaN(numVal) ? null : numVal; // If conversion results in NaN, mark as null.
  }).filter(item => item !== null); // Remove all nulls (invalid numbers) from the array.

  // A warning is issued if the number of parsed items doesn't match the declared count.
  // The algorithm will proceed with the actual number of parsed items.
  if (dataCollection.length !== totalItems) {
    console.warn(`Warning: Declared item count (${totalItems}) differs from actual parsed items (${dataCollection.length}). Proceeding with actual count.`);
  }

  // A utility function to consistently display the current state of the array.
  const displayArrayState = (arr, messagePrefix = "Sequence snapshot:") => {
    // Only log if the array is not empty.
    if (arr.length > 0) {
      console.log(`${messagePrefix} ${arr.join(" ")}`);
    } else {
      console.log(`${messagePrefix} [empty]`);
    }
  };

  // Handle edge cases where sorting is not necessary or trivial.
  if (totalItems <= 1) {
    displayArrayState(dataCollection, "Initial (and final) sequence for trivial case:");
    return;
  }

  // Display the initial unsorted sequence before the sorting process begins.
  displayArrayState(dataCollection, "Initial array state prior to sorting:");

  // Main loop for the Insertion Sort algorithm.
  // It iterates from the second element (index 1) up to the last element.
  // The first element (index 0) is considered to be a sorted sub-array of one element.
  for (let mainCursor = 1; mainCursor < dataCollection.length; mainCursor++) {
    // 'itemToPlace' holds the current element that needs to be inserted into its
    // correct position within the already sorted portion of the array (elements before mainCursor).
    const itemToPlace = dataCollection[mainCursor];
    let scanPosition = mainCursor - 1; // Initialize a pointer to the last element of the sorted sub-array.

    // This inner loop shifts elements that are greater than 'itemToPlace' one position
    // to the right, creating a space for 'itemToPlace'.
    while (scanPosition >= 0 && dataCollection[scanPosition] > itemToPlace) {
      // Shift the element at 'scanPosition' to the right (to 'scanPosition + 1').
      dataCollection[scanPosition + 1] = dataCollection[scanPosition];
      scanPosition--; // Move the pointer to the left to check the next element in the sorted sub-array.
    }

    // After the shifting loop, 'scanPosition + 1' is the correct index where
    // 'itemToPlace' should be inserted.
    dataCollection[scanPosition + 1] = itemToPlace;

    // Display the array's state after the current 'itemToPlace' has been correctly inserted.
    displayArrayState(dataCollection, `Array state after placing element at index ${mainCursor}:`);
  }
}

// The entry point of the script: reads input from standard input (/dev/stdin).
// A try-catch block is used to gracefully handle potential errors during file reading.
try {
  const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
  ProcessInputData(fileContent); // Call the main processing function with the read content.
} catch (readError) {
  // If an error occurs during file reading (e.g., file not found, permission issues),
  // an error message is printed to the console.
  console.error("Failed to read from standard input (/dev/stdin):", readError.message);
  // In a production environment, one might also exit with a non-zero status code here.
}