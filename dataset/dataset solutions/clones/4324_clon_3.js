"use strict";

// This function processes a raw string input containing numerical data,
// extracts specific relationships, and calculates a derived aggregate value.
const analyzeInputDataSet = (inputPayload) => {
  // Implement a robust check for valid input payload.
  // If the input is not a string, or is empty after trimming, an error is reported.
  if (typeof inputPayload !== 'string' || inputPayload.trim() === '') {
    console.error("Processing Error: Input payload is either undefined, not a string, or empty. Cannot proceed with analysis.");
    return; // Exit if input is invalid.
  }

  // Split the entire input block into individual lines.
  // We filter out any lines that are empty or contain only whitespace,
  // which might occur due to extra newline characters in the input.
  const dataLines = inputPayload
    .split('\n')
    .filter(line => line.trim() !== '');

  // The very first line of the input might contain metadata (e.g., total count).
  // For this specific analysis, this metadata is not directly used in the calculation,
  // so we extract it and implicitly discard its value.
  const initialHeaderInfo = dataLines.shift();
  // console.log(`Debug: Header line encountered (and ignored for calculation): ${initialHeaderInfo}`); // Optional debug output

  // Initialize data structures to hold our parsed numerical pairs and their primary identifiers.
  const parsedNumericalPairs = []; // Stores [key, value] pairs as arrays
  const primaryKeysCollected = []; // Stores only the key (first number) from each pair

  // Iterate over the remaining data lines to parse numerical information.
  // Each line is expected to contain two space-separated integers.
  for (let i = 0; i < dataLines.length; i++) {
    const currentLineContent = dataLines[i];
    const rawParts = currentLineContent.split(' ');

    // Validate that each line splits into exactly two parts and both parts are valid numbers.
    const isFirstPartNumeric = !isNaN(Number(rawParts[0]));
    const isSecondPartNumeric = !isNaN(Number(rawParts[1]));

    if (rawParts.length === 2 && isFirstPartNumeric && isSecondPartNumeric) {
      const identifierValue = Number(rawParts[0]);
      const associatedDatum = Number(rawParts[1]);

      parsedNumericalPairs.push([identifierValue, associatedDatum]);
      primaryKeysCollected.push(identifierValue); // Add the identifier to our collection
    } else {
      // Log a warning if a line is malformed, but continue processing valid lines.
      console.warn(`Data Parsing Warning: Line ${i + 2} ("${currentLineContent}") was malformed and has been skipped.`);
    }
  }

  // If no valid data records were successfully parsed, we cannot perform the calculation.
  if (primaryKeysCollected.length === 0) {
    console.error("Processing Error: No valid numerical data records were found for analysis after parsing.");
    return;
  }

  // Create a lookup map for efficient retrieval of associated data using primary keys.
  // This allows O(1) average time complexity for value lookups.
  const identifierToDatumMap = new Map();
  parsedNumericalPairs.forEach(pair => {
    identifierToDatumMap.set(pair[0], pair[1]);
  });

  // Determine the maximum primary identifier value encountered in the dataset.
  // An iterative approach is used to find the maximum, which is generally robust.
  let maximalIdentifier = -Infinity;
  for (const keyCandidate of primaryKeysCollected) {
    if (keyCandidate > maximalIdentifier) {
      maximalIdentifier = keyCandidate;
    }
  }

  // Retrieve the datum associated with the maximal identifier from our map.
  const datumForMaxIdentifier = identifierToDatumMap.get(maximalIdentifier);

  // A final validation step: ensure the retrieved datum is a valid number.
  if (typeof datumForMaxIdentifier !== 'number' || isNaN(datumForMaxIdentifier)) {
    console.error(`Calculation Error: Could not find a valid numerical datum associated with the maximal identifier (${maximalIdentifier}).`);
    return;
  }

  // Compute the final result by summing the maximal identifier and its corresponding datum.
  const finalComputedResult = maximalIdentifier + datumForMaxIdentifier;

  // Output the final calculated value to the console.
  console.log(finalComputedResult);
};

// The application's entry point: reads input from standard input and initiates processing.
try {
  const fileSystemModule = require('fs');
  const stdInputBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
  analyzeInputDataSet(stdInputBuffer);
} catch (ioError) {
  // Catch and report any errors that occur during file reading or initial function execution.
  console.error("Application Fatal Error: Failed to read from standard input or execute analysis function.", ioError.message);
}