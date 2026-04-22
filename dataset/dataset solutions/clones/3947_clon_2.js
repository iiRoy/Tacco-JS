/*
 * This function is designed to ingest and process a collection of raw text lines.
 * It identifies numerical pairs within these lines, categorizes them into two distinct sets,
 * sorts these sets based on specific criteria, and then calculates the number of successful
 * pairings that meet a predefined condition.
 */
function processInputData (dataLines) {

  // The very first line of the input stream specifies the total quantity
  // of primary and secondary records that need to be processed.
  const recordCount = parseInt(dataLines[0], 10);

  // Initialize two distinct arrays to hold the parsed numeric tuples.
  // These will store the processed data from the input.
  let firstCollection = [];
  let secondCollection = [];

  // Iterate through the input lines, starting from the second line,
  // to populate both collections with their respective numerical pairs.
  // Each pair consists of two space-separated integers.
  for (let lineIndex = 1; lineIndex <= recordCount; lineIndex++) {
    // Extract and convert the string values into integers for the first collection.
    firstCollection.push(
      dataLines[lineIndex]
        .split(" ")
        .map(stringValue => parseInt(stringValue, 10))
    );

    // Extract and convert string values for the second collection.
    // The indices for this collection are offset by 'recordCount'.
    secondCollection.push(
      dataLines[lineIndex + recordCount]
        .split(" ")
        .map(stringValue => parseInt(stringValue, 10))
    );
  }

  // Apply a custom sorting algorithm to the first collection.
  // The comparison logic prioritizes the second element if the first is larger,
  // otherwise it uses the first element for comparison.
  firstCollection.sort((itemX, itemY) =>
    itemX[0] > itemX[1] ? (itemX[1] - itemY[1]) : (itemX[0] - itemY[0])
  );

  // Apply a slightly different custom sorting algorithm to the second collection.
  // This unique order is essential for the subsequent matching phase.
  secondCollection.sort((itemX, itemY) =>
    itemX[0] > itemX[1] ? (itemY[1] - itemX[1]) : (itemX[0] - itemY[0])
  );

  // Declare and initialize index pointers for traversing both sorted collections,
  // along with a counter for the number of successful matches found.
  let ptrX = 0;
  let ptrY = 0;
  let unusedMax = 0; // This variable is present for structural consistency but not utilized.
  let successfulPairs = 0;

  // Begin the core matching loop. This loop continues as long as
  // both pointers remain within the bounds of their respective collections.
  while (ptrX < recordCount && ptrY < recordCount) {
    const currentX = firstCollection[ptrX];   // Retrieve the current pair from the first collection.
    const currentY = secondCollection[ptrY];  // Retrieve the current pair from the second collection.

    // Evaluate the condition for a successful pair:
    // Both components of 'currentX' must be strictly less than their counterparts in 'currentY'.
    if (currentX[0] < currentY[0] && currentX[1] < currentY[1]) {
      successfulPairs++; // Increment the count if the condition is met.
      ptrX++;            // Advance both pointers to look for the next potential match.
      ptrY++;
    } else {
      ptrY++;            // If the condition is not met, only advance the second collection's pointer.
                         // This is to find a potentially suitable 'currentY' for the current 'currentX'.
    }
  }

  // Output the final tally of successful pairs to the console.
  console.log(successfulPairs);
}

// Invoke the primary processing function by reading input from standard I/O.
// The input is read as a string, cleansed of leading/trailing whitespace,
// and then divided into an array of individual lines.
processInputData(
  require('fs')
    .readFileSync('/dev/stdin', 'utf8')
    .trim()
    .split("\n")
);