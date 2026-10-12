function ProcessInputData(rawDataString) {
  // Convert the raw input string into an array of numerical values.
  // Each line is treated as a separate number.
  let numericValues = rawDataString.split("\n").map(Number);

  // The first number in the input is stored, though not used in the subsequent logic.
  const initialCount = numericValues[0];

  // Remove the very last element from the array of numbers.
  numericValues.pop();

  // Remove the first element from the array (which was stored in initialCount).
  numericValues.shift();

  // Initialize a dynamic collection with the current first element of the processed array.
  let uniqueElementsTracker = [numericValues[0]];

  // Remove this element from the main array as it's now in the tracker.
  numericValues.shift();

  // Iterate through each remaining number in the array.
  numericValues.forEach((currentValue) => {
    // Check if the current number is already present in our unique elements collection.
    if (uniqueElementsTracker.some((trackedItem) => trackedItem === currentValue)) {
      // If it is found, remove the first instance of this number from the collection.
      uniqueElementsTracker.splice(uniqueElementsTracker.indexOf(currentValue), 1);
    } else {
      // If it's not found, add the current number to the collection.
      uniqueElementsTracker.push(currentValue);
    }
  });

  // Print the final number of elements remaining in the unique elements collection.
  console.log(uniqueElementsTracker.length);
}

// Read the entire content of standard input as a UTF-8 string
// and then pass it to our data processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
