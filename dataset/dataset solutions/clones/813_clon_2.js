const fileSystem = require('fs');

/*
 * This section is responsible for obtaining the initial data.
 * It reads the entire content from the standard input stream.
 * The input is expected to be a text file encoded in UTF-8.
 */
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

// The raw input string is then processed:
//   1. Leading and trailing whitespace is removed.
//   2. The string is split into an array of individual lines based on newline characters.
const parsedInputLines = rawInputContent.trim().split("\n");

// A numerical indicator to keep track of the current line being processed from the 'parsedInputLines' array.
let currentLinePointer = 0;

// This is the primary processing cycle. It continues indefinitely until an explicit break condition is met.
while (true) {

  // Extract numerical dimensions from the current line of input.
  // The line is split by any sequence of whitespace characters, and each resulting part is converted to a number.
  const currentDimensions = parsedInputLines[currentLinePointer]
    .split(/\s+/)
    .map(Number);

  // Increment the line pointer to move to the next line for subsequent reads.
  currentLinePointer++;

  // Assign the extracted dimension values to descriptive constants.
  const firstDimensionValue = currentDimensions[0];
  const secondDimensionValue = currentDimensions[1];

  // Check the termination condition for the main loop.
  // If both dimension values are zero, it signifies the end of input data.
  if (firstDimensionValue === 0 && secondDimensionValue === 0) {
    break; // Exit the while loop.
  }

  // Initialize an array to maintain the operational status of various entities.
  // The size of this array corresponds to the 'firstDimensionValue'.
  const entityOperationalStatus = [];

  // Populate the 'entityOperationalStatus' array.
  // By default, all entities are initially marked as 'operational' (true).
  for (let entityIndex = 0; entityIndex < firstDimensionValue; entityIndex++) {
    entityOperationalStatus[entityIndex] = true;
  }

  // A specific rule is applied: the very first entity (at index 0) is immediately marked as 'non-operational' (false).
  entityOperationalStatus[0] = false;

  // Create an empty array to store details of various interactions or events.
  const interactionRecords = [];

  // Loop through a number of lines corresponding to 'secondDimensionValue' to gather interaction data.
  for (let interactionCount = 0; interactionCount < secondDimensionValue; interactionCount++) {
    // Parse the current line to get specific details for an interaction.
    // Similar to dimension parsing, it splits by whitespace and converts to numbers.
    const interactionDetails = parsedInputLines[currentLinePointer]
      .split(/\s+/)
      .map(Number);

    // Advance the line pointer after reading an interaction detail line.
    currentLinePointer++;

    // Store the parsed interaction details.
    // Note: The second and third elements are adjusted to be 0-indexed.
    interactionRecords.push([
      interactionDetails[0],
      interactionDetails[1] - 1,
      interactionDetails[2] - 1
    ]);
  }

  // Sort the collected interaction records.
  // IMPORTANT: The original comparator `a - b` where `a` and `b` are arrays will lead to `NaN`
  // when JavaScript attempts to implicitly convert arrays to primitive values for subtraction.
  // This results in an undefined sort order according to the ECMAScript specification.
  // This specific (potentially non-deterministic) behavior is preserved to maintain Type II cloning fidelity.
  interactionRecords.sort(function (firstRecordEntry, secondRecordEntry) {
    return firstRecordEntry - secondRecordEntry;
  });


  // Iterate over each sorted interaction record to update the statuses of entities.
  interactionRecords.forEach(function (currentInteractionTuple) {
    // Extract the indices of the two entities involved in the current interaction.
    const sourceParticipant = currentInteractionTuple[1];
    const targetParticipant = currentInteractionTuple[2];

    // Apply the propagation rule:
    // If the 'sourceParticipant' is found to be 'non-operational' (false),
    // then the 'targetParticipant' also becomes 'non-operational'.
    if (!entityOperationalStatus[sourceParticipant]) {
      entityOperationalStatus[targetParticipant] = false;
    }
  });

  // Initialize a counter to tally the number of entities that are 'non-operational'.
  let operationalEntityCounter = 0;

  // Iterate through the final 'entityOperationalStatus' array.
  entityOperationalStatus.forEach(function (entityCurrentState) {
    // For each entity, if its status is 'non-operational' (false), increment the counter.
    if (!entityCurrentState) {
      operationalEntityCounter++;
    }
  });

  // Output the final computed count of 'non-operational' entities to the console.
  console.log(operationalEntityCounter);
}