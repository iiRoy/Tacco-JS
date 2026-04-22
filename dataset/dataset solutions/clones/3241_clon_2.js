function ProcessData(incomingData) {
  // Split the entire input string into individual lines
  let processedLines = incomingData.split("\n");

  // Parse the first line to get the total number of entries
  const itemCount = parseInt(processedLines[0], 10);

  // Initialize two arrays to store parsed data
  const primarySet = new Array(itemCount);
  const secondarySet = new Array(itemCount);

  // Loop through the remaining lines to populate the data arrays
  for (let elementIndex = 0; elementIndex < itemCount; elementIndex++) {
    // Split each line by space to get individual components
    const rowTokens = processedLines[elementIndex + 1].split(" ");

    // Parse components and store them along with the original index
    primarySet[elementIndex] = [
      parseInt(rowTokens[0], 10),
      parseInt(rowTokens[1], 10),
      elementIndex,
    ];
    secondarySet[elementIndex] = [
      parseInt(rowTokens[0], 10),
      parseInt(rowTokens[1], 10),
      elementIndex,
    ];
  }

  // Initialize control variables
  let selectorFlag = 0; // Toggles between processing primarySet and secondarySet
  let totalScoreX = 0; // Accumulator for values from primarySet
  let totalScoreY = 0; // Accumulator for values from secondarySet

  // Sort the datasets based on their respective comparison criteria
  primarySet.sort(firstSorter);
  secondarySet.sort(secondSorter);

  // Create a list to keep track of indices that have already been processed
  const visitedElements = [];

  // Main processing loop, iterating 'itemCount' times
  for (let loopCounter = 0; loopCounter < itemCount; loopCounter++) {
    // Check the current state of the selector flag
    if (selectorFlag === 0) {
      // If flag is 0, process primarySet
      // Skip elements if their index is already in the visited list
      while (visitedElements.includes(primarySet[0][2])) {
        primarySet.shift(); // Remove the element
      }
      totalScoreX += primarySet[0][0]; // Add the first component to accumulator X
      selectorFlag = 1; // Toggle the flag
      visitedElements.push(primarySet[0][2]); // Mark the index as visited
      primarySet.shift(); // Remove the processed element
    } else {
      // If flag is 1, process secondarySet
      // Skip elements if their index is already in the visited list
      while (visitedElements.includes(secondarySet[0][2])) {
        secondarySet.shift(); // Remove the element
      }
      totalScoreY += secondarySet[0][1]; // Add the second component to accumulator Y
      selectorFlag = 0; // Toggle the flag
      visitedElements.push(secondarySet[0][2]); // Mark the index as visited
      secondarySet.shift(); // Remove the processed element
    }
  }

  // Calculate the final result as the difference between the two accumulators
  const calculatedDifference = totalScoreX - totalScoreY;

  // Output the computed result
  console.log("%s", calculatedDifference);
}

// Helper function for sorting the first dataset
function firstSorter(elementA, elementB) {
  // Compare based on the first component (index 0) in descending order
  if (elementA[0] < elementB[0]) return 1;
  if (elementA[0] > elementB[0]) return -1;
  // If first components are equal, compare based on the second component (index 1) in descending order
  if (elementA[1] < elementB[1]) return 1;
  if (elementA[1] > elementB[1]) return -1;
  return 0; // Elements are considered equal
}

// Helper function for sorting the second dataset
function secondSorter(elementA, elementB) {
  // Compare based on the second component (index 1) in descending order
  if (elementA[1] < elementB[1]) return 1;
  if (elementA[1] > elementB[1]) return -1;
  // If second components are equal, compare based on the first component (index 0) in descending order
  if (elementA[0] < elementB[0]) return 1;
  if (elementA[0] > elementB[0]) return -1;
  return 0; // Elements are considered equal
}

// Function to activate when the "Run" button is clicked (for local testing)
function testProgram() {
  const userInputContent = document.getElementById("input").value;
  ProcessData(userInputContent);
}

// Execute the primary data processing using standard input from the file system
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));