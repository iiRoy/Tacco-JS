let buildingHeights; // This will store the parsed height measurements, equivalent to the original Hlist.

/**
 * Initializes the application by processing the raw input string.
 * It handles data parsing and validation before invoking the core logic.
 * @param {string} rawInputContent - The complete raw string read from the input source.
 */
function prepareDataForProcessing(rawInputContent) {
  // Defensive checks to ensure input is valid and not empty.
  if (typeof rawInputContent !== 'string' || rawInputContent.trim() === '') {
    console.error("Input processing error: Provided raw content is empty or not a string.");
    buildingHeights = []; // Initialize to an empty array to prevent subsequent errors.
    return;
  }

  // Split the raw input into individual lines.
  const contentLines = rawInputContent.split('\n');

  // Verify that there are enough lines to extract height data.
  // The original problem structure implies at least two lines (N and Hlist).
  if (contentLines.length < 2) {
    console.error("Input processing error: Insufficient lines in input data. Expected at least two.");
    buildingHeights = [];
    return;
  }

  // The first line (N in the original) is not utilized by the core logic,
  // so its parsing is omitted to demonstrate a deletion of non-essential code.
  // const totalCountOfItems = Number(contentLines[0]); // This line is intentionally removed.

  // Extract the second line which contains the space-separated height values.
  const heightValuesString = contentLines[1];

  // Validate the height values string itself.
  if (!heightValuesString || heightValuesString.trim() === '') {
    console.warn("Input processing warning: The line containing height values is empty.");
    buildingHeights = [];
    return;
  }

  // Split the height string into individual string representations of heights.
  const individualHeightStrings = heightValuesString.split(' ');

  // Create a temporary array to store the parsed numeric heights.
  let temporaryParsedHeights = [];

  // Iterate through each height string and convert it to a number.
  // This replaces the original .map() function with a traditional for loop,
  // and adds explicit error checking for non-numeric values.
  for (let k = 0; k < individualHeightStrings.length; k++) {
    const currentHeightString = individualHeightStrings[k];
    const numericHeight = Number(currentHeightString);

    // Validate if the parsed value is a valid number.
    if (!isNaN(numericHeight)) {
      temporaryParsedHeights.push(numericHeight);
    } else {
      console.warn(`Input processing warning: Encountered non-numeric height '${currentHeightString}', skipping this value.`);
    }
  }

  // Assign the completely parsed and validated height array to the global variable.
  buildingHeights = temporaryParsedHeights;

  // After data preparation, trigger the main calculation logic.
  executeVisibilityCalculation();
}

/**
 * Performs the primary calculation to determine how many structures are visible
 * from a left-to-right perspective, based on their heights.
 * This function operates on the globally available 'buildingHeights' array.
 */
function executeVisibilityCalculation() {
  // A guard clause to handle cases where no height data was successfully loaded.
  if (!buildingHeights || buildingHeights.length === 0) {
    console.log("Visibility calculation skipped: No valid building heights available.");
    return;
  }

  let countOfVisibleStructures = 0; // Renamed from 'count'
  // Initialize the highest point observed so far to negative infinity
  // This ensures that the very first structure, regardless of its height, will be counted.
  let currentMaxHeightSeen = -Infinity; // Renamed from 'current' and given a more robust initial value.

  // Iterate through the building heights using a standard for loop,
  // instead of the original forEach, to demonstrate a structural change.
  for (let structureIndex = 0; structureIndex < buildingHeights.length; structureIndex++) {
    // Retrieve the height of the current structure.
    const heightOfCurrentStructure = buildingHeights[structureIndex]; // Renamed from 'd'

    // Introduce an intermediate boolean variable for clarity in the condition.
    const isCurrentStructureAtLeastAsTallAsPreviousMax = (heightOfCurrentStructure >= currentMaxHeightSeen);

    if (isCurrentStructureAtLeastAsTallAsPreviousMax) {
      // If the current structure is taller or equal to the highest one seen so far,
      // it means it is visible. Increment the counter using an alternative syntax.
      countOfVisibleStructures += 1;
      // Update the highest point observed.
      currentMaxHeightSeen = heightOfCurrentStructure;
    }
    // No 'else' block is needed as structures not meeting the criteria are simply ignored.
  }

  // Output the final result with a descriptive message.
  console.log("Result: The total number of visible structures from left is: " + countOfVisibleStructures);
}

// Entry point of the application: Read input from stdin and start processing.
// Using different variable names for the file system module and its output.
const fileSystemUtility = require("fs");
const inputContentFromFile = fileSystemUtility.readFileSync("/dev/stdin", "utf8");

// Call the main setup function with the content read from the file.
prepareDataForProcessing(inputContentFromFile);