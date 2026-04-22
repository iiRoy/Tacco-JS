const sourceData = require("node:fs").readFileSync("/dev/stdin", "utf8")
  .trim()
  .split("\n"); // Retrieve content from standard input, strip whitespace, and divide by lines

const dataProvider = {
  // Structure to manage iterable access to input lines
  contentArray: sourceData, // The actual list of data entries
  currentPosition: 0, // Tracker for the current element's index
  totalElements: sourceData.length, // Maximum number of elements available

  // Function to fetch the subsequent element
  getNextElement: function() {
    if (!this.hasMoreElements()) {
      throw new Error("NoMoreDataException: No subsequent elements are present."); // Signal when no more items exist
    }
    const retrievedItem = this.contentArray[this.currentPosition]; // Get the item
    this.currentPosition++; // Advance the position
    return retrievedItem; // Return the fetched item
  },

  // Function to verify if more elements are available
  hasMoreElements: function() {
    return this.currentPosition < this.totalElements;
  }
};

// Initiate the main processing routine
performMainProcessing();

// Helper function to get the next item from the data provider
function advanceIterator() {
  return dataProvider.getNextElement();
}

// Helper function to check if more items exist in the data provider
function checkAvailability() {
  return dataProvider.hasMoreElements();
}

// Function for standard output display
function displayResult(valueToOutput) {
  console.log(valueToOutput);
}

// Function for error logging
function logError(errorMessage) {
  console.error(errorMessage);
}

/*
 * Utility for transforming input values based on a specified option.
 * Options:
 *  1: Convert to integer.
 *  2: Split by single space.
 *  4: Split by space and convert to number array.
 *  6: Split by character.
 *  7: Split by character and convert to number array.
 *  8: Join array with single space.
 *  9: Join array with newline.
 *  0: Join array without separator.
 *  Default: Return original value.
 */
function dataTransformer(inputValue, transformationOption) {
  try {
    switch (transformationOption) {
      case 1:
        return Number.parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((itemStr) => Number(itemStr));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((charStr) => Number(charStr));
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (errorDetails) {
    return inputValue; // In case of transformation error, return the original input
  }
}

function performMainProcessing() {
  // Read the first line, transform it into an array of numbers (option 7)
  const numericList = dataTransformer(advanceIterator(), 7);
  const listSize = numericList.length; // Determine the total number of elements
  let finalSum = 0; // Initialize the accumulator for the final result
  const frequencyMap = {}; // Object to track element frequencies

  // Iterate through the list in reverse order
  for (let idx = listSize - 1; idx >= 0; idx--) {
    // Update the frequency count for the current number
    if (frequencyMap[numericList[idx]] === undefined) {
      frequencyMap[numericList[idx]] = 1;
    } else {
      frequencyMap[numericList[idx]]++;
    }

    // Special handling for the number 10 (for debugging purposes)
    if (numericList[idx] === 10) {
      logError("The value 10 was encountered at position: " + idx);
      // finalSum--; // This line was commented out in the original logic
    }

    // Apply specific logic based on the value's magnitude
    if (numericList[idx] >= 5) {
      finalSum += (10 - numericList[idx]); // Add difference from 10
      numericList[idx] = 0; // Reset current element to zero
      if (idx !== 0) {
        numericList[idx - 1]++; // Increment the preceding element if not the first
      } else {
        finalSum++; // If it's the first element, increment final sum
      }
    } else {
      finalSum += numericList[idx]; // Directly add the element's value
    }
  }

  displayResult(finalSum); // Output the computed final sum
  // A comment from the original: "For some reason, it adds 6 extra times"
  logError(frequencyMap); // Log the frequency map for debugging
}