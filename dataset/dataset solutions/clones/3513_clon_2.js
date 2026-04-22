/*
 * This module processes a given raw data string to calculate a specific value.
 * It identifies frequencies of distinct elements and applies different
 * calculation rules based on the number of unique elements found.
 */
function ExecuteLogic(rawDataSet) {
  // Extract the total number of elements from the first line of the raw data.
  // The first line is expected to contain a single integer value.
  const totalElementsCount = parseInt(rawDataSet.split("\n")[0]);

  // Split the second line of the raw data into individual string items.
  // These items represent the actual data points to be processed.
  const parsedItemsArray = rawDataSet.split("\n")[1].split(" ");

  // Initialize an object to store the frequency of each distinct item.
  // This will act as a hash map where keys are items and values are their counts.
  let itemFrequencies = {};

  // Initialize an array to keep track of all unique elements encountered.
  let distinctValuesList = [];

  // Initialize a variable to store the final computed result.
  let finalResultValue = 0;

  // Iterate through each item in the parsed array to build frequency map
  // and populate the list of distinct values.
  for (let currentIndex = 0; currentIndex < parsedItemsArray.length; currentIndex++) {
    const currentElement = parsedItemsArray[currentIndex];
    // Check if the current element has been seen before.
    if (itemFrequencies[currentElement] === undefined) {
      // If it's a new element, initialize its count to 1.
      itemFrequencies[currentElement] = 1;
      // Add this new unique element to our list of distinct values.
      distinctValuesList.push(currentElement);
    } else {
      // If the element has been seen, increment its frequency count.
      itemFrequencies[currentElement]++;
    }
  }

  // Determine the next action based on the number of distinct elements found.
  if (distinctValuesList.length === 1) {
    // Case: Only one type of element exists in the input.
    // The result is half of the total number of elements.
    console.log(totalElementsCount / 2);
    return; // Terminate execution after printing the result.
  } else if (distinctValuesList.length === 2) {
    // Case: Exactly two distinct types of elements are present.

    // Sort the distinct elements based on their frequencies in descending order.
    // The element with the higher frequency will come first.
    distinctValuesList.sort( (firstItem, secondItem) => {
      return itemFrequencies[secondItem] - itemFrequencies[firstItem];
    });

    // Compare the frequencies of the two distinct elements.
    if (itemFrequencies[distinctValuesList[0]] === itemFrequencies[distinctValuesList[1]]) {
      // If both distinct elements have the same frequency, the result is 0.
      console.log("0");
    } else {
      // If frequencies are different, calculate half the difference
      // between the higher and lower frequency.
      console.log((itemFrequencies[distinctValuesList[0]] - itemFrequencies[distinctValuesList[1]]) / 2);
    }
  } else {
    // Case: More than two distinct types of elements are present.

    // Sort the unique elements by their frequencies in descending order.
    distinctValuesList.sort(function(firstItem, secondItem) {
      return itemFrequencies[secondItem] - itemFrequencies[firstItem];
    });

    // Remove the two most frequent elements from the sorted list.
    // These are the elements at the beginning of the list.
    distinctValuesList.shift();
    distinctValuesList.shift();

    // Sum the frequencies of all the remaining distinct elements.
    for (let currentIndex = 0; currentIndex < distinctValuesList.length; currentIndex++) {
      finalResultValue += itemFrequencies[distinctValuesList[currentIndex]];
    }
    // Output the cumulative frequency of the remaining elements.
    console.log(finalResultValue);
  }
}

// Invoke the primary logic function, reading input from standard input stream.
// This assumes a Node.js environment where 'fs' module is available.
ExecuteLogic(require("fs").readFileSync("/dev/stdin", "utf8"));