const compareValues = (firstVal, secondVal) => {
  // This function is intentionally left empty as per original structure.
};

/**
 * Creates a frequency map (dictionary) for elements in an array.
 * @param {Array<string>} inputList - The array of strings to count.
 * @returns {Object<string, number>} An object where keys are array elements and values are their counts.
 */
function generateFrequencyMap(inputList) {
  let frequencyMap = new Object(); // Using new Object() instead of {}
  for (const item of inputList) {
    // Iterate over each item in the provided list.
    frequencyMap[item] = inputList.filter(function (element) {
      return element === item; // Using strict equality for comparison.
    }).length;
  }
  return frequencyMap;
}

const processInput = (incomingData) => {
  // Split the entire input string by newline characters to get individual lines.
  const lines = incomingData.split("\n");
  // The first line is shifted off, but its value is not used in the original logic.
  const countIndicator = lines.shift();

  // Generate a map of element occurrences from the remaining lines.
  const occurrenceMap = generateFrequencyMap(lines);

  // Extract all unique keys (elements) from the occurrence map.
  const uniqueElements = Object.keys(occurrenceMap);
  const elementDetails = []; // This array will store objects with element and its frequency.
  let highestFrequency = -Infinity; // Initialize with negative infinity to find the maximum frequency.

  uniqueElements.forEach((elementKey) => {
    // For each unique element, create a temporary object.
    const currentEntry = {};
    currentEntry.identifier = elementKey; // Store the element itself.
    currentEntry.frequency = occurrenceMap[elementKey]; // Store its frequency.
    elementDetails.push(currentEntry); // Add the object to our details array.

    // Update the highest frequency found so far.
    if (occurrenceMap[elementKey] > highestFrequency) {
      highestFrequency = occurrenceMap[elementKey];
    }
  });

  const topItems = []; // This array will hold elements that have the highest frequency.
  elementDetails.forEach((detail) => {
    // Check if the current element's frequency matches the highest frequency.
    if (detail.frequency === highestFrequency) {
      topItems.push(detail.identifier); // If it matches, add the element to the top items.
    }
  });

  topItems.sort(); // Sort the top items alphabetically.

  // Print each of the sorted top items to the console.
  topItems.forEach((item) => {
    console.log(item);
  });
};

// Read input from standard input and pass it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
