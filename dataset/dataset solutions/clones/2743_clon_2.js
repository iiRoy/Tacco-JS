function ProcessInput(rawData) {
  // Split the raw input string into individual lines.
  const processedLines = rawData.split("\n");

  // Parse the first line to get the total number of elements.
  const totalElements = parseInt(processedLines[0], 10);

  // Extract and parse the subsequent lines into an array of numeric values.
  const numericValues = processedLines.slice(1).map(val => parseInt(val, 10));

  // Initialize a Map to store color identifiers and their associated values.
  // This map effectively tracks the "tails" of increasing subsequences.
  let colorMap = new Map();

  // Set the initial color identifier (0) with the first numeric value.
  colorMap.set(0, numericValues[0]);

  // Initialize a counter for unique color identifiers.
  let currentIdentifier = 0;

  // Iterate through the numeric values starting from the second element.
  for (let idx = 1; idx < totalElements; idx++) {
    let foundIdentifier = null; // Variable to hold a potential identifier for update.

    // Convert the current map entries into an array for easier iteration and access.
    // This snapshot is important as the map might be updated.
    const mapEntries = [...colorMap.entries()];

    // Iterate through the existing color identifiers to find a suitable one.
    // The loop goes up to `currentIdentifier` which represents the highest ID used so far.
    for (let k = 0; k <= currentIdentifier; k++) {
      // Check if the value associated with the current map entry is less than the
      // current numeric value being processed.
      if (mapEntries[k][1] < numericValues[idx]) {
        foundIdentifier = mapEntries[k][0]; // Store the identifier.
        break; // A suitable identifier is found, exit the inner loop.
      }
    }

    // If no suitable identifier was found (meaning the current number is smaller
    // than all existing "tails" or it's a new highest value for a new sequence).
    if (foundIdentifier === null) {
      currentIdentifier++; // Increment the unique identifier counter.
      colorMap.set(currentIdentifier, numericValues[idx]); // Add a new entry to the map.
    } else {
      // If a suitable identifier was found, update its associated value in the map.
      // This effectively extends an existing increasing subsequence.
      colorMap.set(foundIdentifier, numericValues[idx]);
    }

    // Re-sort the map entries based on their values in descending order.
    // This ensures that when we iterate to find a `foundIdentifier`, we prioritize
    // updating the "longest" (highest value) sequence first.
    // A new Map is created from the sorted entries to maintain the order.
    colorMap = new Map([...colorMap.entries()].sort((entryA, entryB) => entryB[1] - entryA[1]));
  }

  // The final answer is the total number of unique color identifiers used plus one.
  // This represents the length of the longest increasing subsequence.
  console.log(currentIdentifier + 1);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
