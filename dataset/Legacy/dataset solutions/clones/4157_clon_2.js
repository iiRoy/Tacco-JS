function processFrequency(dataCollection) {
  // Initialize two arrays: one for unique elements and one for their frequencies.
  let uniqueElements = [];
  let elementCounts = [];
  let lastProcessedItem; // Stores the previously encountered item for comparison.

  // Sort the input collection to group identical elements together.
  dataCollection.sort();

  // Iterate through the sorted collection.
  for (let idx = 0; idx < dataCollection.length; idx++) {
    // If the current element is different from the last one, it's a new unique element.
    if (dataCollection[idx] !== lastProcessedItem) {
      uniqueElements.push(dataCollection[idx]); // Add the new unique element.
      elementCounts.push(1); // Start its count at 1.
    } else {
      // If it's the same as the last, increment the count of the last unique element.
      elementCounts[elementCounts.length - 1]++;
    }
    lastProcessedItem = dataCollection[idx]; // Update the last processed item.
  }

  // Return a tuple containing the unique elements and their respective counts.
  return [uniqueElements, elementCounts];
}

function executeProgram(rawInputData) {
  // Split the raw input string into lines.
  rawInputData = rawInputData.split("\n");

  // Parse the first line as the total number of items (though not directly used in the core logic).
  const totalItems = parseInt(rawInputData[0], 10);

  // Split the second line by spaces to get string representations of numbers.
  let numericValues = rawInputData[1].split(" ");
  // Convert each string representation to an integer in place.
  numericValues.forEach((currentValue, currentIndex, targetArray) => {
    targetArray[currentIndex] = parseInt(currentValue, 10);
  });

  // Call the frequency processing function with the prepared array.
  const frequencyResult = processFrequency(numericValues);

  let adjustmentCounter = 0; // Initialize a counter for necessary adjustments.

  // Iterate through the unique numbers and their counts obtained from the frequency analysis.
  for (let loopIndex = 0; loopIndex < frequencyResult[0].length; loopIndex++) {
    const currentNumber = frequencyResult[0][loopIndex]; // The unique number itself.
    const occurrenceCount = frequencyResult[1][loopIndex]; // How many times it appeared.

    // Check if the number value is different from its occurrence count.
    if (currentNumber !== occurrenceCount) {
      if (currentNumber < occurrenceCount) {
        // If the count is greater than the number, we need to reduce the count.
        // The difference represents how many items need to be removed or adjusted.
        adjustmentCounter += occurrenceCount - currentNumber;
      }
      if (currentNumber > occurrenceCount) {
        // If the number is greater than its count, we can only remove all occurrences.
        // The count itself represents the number of items to be removed.
        adjustmentCounter += occurrenceCount;
      }
    }
  }

  // Output the final calculated adjustment count to the console.
  console.log(adjustmentCounter);
}

// The following line handles standard input/output and invokes the main program logic.
// It should not be modified as per instructions.
executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
