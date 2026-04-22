// This function processes incoming textual information
function ProcessInput(rawData) {

  // Break the entire data block into individual lines
  let lineArray = rawData.split("\n");

  // The second line (index 1) contains space-separated numeric values
  let valueTokens = lineArray[1].split(" ");

  // Initialize a counter for elements meeting a specific condition
  let occurrences = 0;
  // Set an initial high threshold for finding the minimum value
  let lowestEncountered = Number.MAX_SAFE_INTEGER;

  // Iterate through the elements based on the count provided in the first line
  for (let elementIndex = 0; elementIndex < Number(lineArray[0]); elementIndex++) {

    // Parse the current value from its string representation
    let itemValue = Number(valueTokens[elementIndex]);

    // If the current item is less than or equal to the lowest encountered so far
    if (itemValue <= lowestEncountered) {
      // Increment our count of qualifying items
      occurrences++;
    }

    // If the current item represents a new minimum (or is equal to the current minimum)
    if (lowestEncountered >= itemValue) {
      // Update the stored minimum value
      lowestEncountered = itemValue;
    }
  }

  // Output the final tally of qualifying items
  console.log(occurrences);
}

// *** Do not modify the following section (it handles reading input and calling the main processing function) ***
ProcessInput( require("fs").readFileSync("/dev/stdin", "utf8") );