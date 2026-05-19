// Function to convert a given string representation to an integer value.
function parseInteger(inputString) {
  return parseInt(inputString);
}

// Function to compute the sum of absolute differences between all adjacent elements in an array.
function calculateAbsoluteDifferencesSum(numberArray) {
  let totalDifference = 0; // Initialize a variable to accumulate the sum of differences.

  // Iterate through the array from the first element up to the second-to-last element.
  for (let idx = 0; idx < numberArray.length - 1; idx++) {
    // Add the absolute difference between the current element and the next element to the total.
    totalDifference += Math.abs(numberArray[idx] - numberArray[idx + 1]);
  }
  return totalDifference; // Return the final calculated sum of absolute differences.
}

// This function constructs an ordered collection by strategically picking elements from a source collection.
// It alternates between 'min' and 'max' strategies to place elements at either end of the growing collection.
// Note: This function is defined in the original code but is not called by the main execution flow.
function constructOrderedCollection(currentStrategy, sourceCollection, targetSize) {
  let finalCollection = []; // Initialize an empty array to store the constructed collection.

  // Continue adding elements until the final collection reaches the specified target size.
  while (finalCollection.length < targetSize) {
    if (currentStrategy === 'min') {
      // If the current strategy is 'min', prioritize minimizing the difference.
      if (finalCollection.length === 0) {
        // If the final collection is empty, simply add the first element from the source.
        finalCollection.push(sourceCollection[0]);
        sourceCollection.shift(); // Remove the element from the beginning of the source collection.
      } else {
        // Compare the absolute difference if the first source element is added to the front vs. the end.
        if (Math.abs(finalCollection[0] - sourceCollection[0]) > Math.abs(finalCollection[finalCollection.length - 1] - sourceCollection[0])) {
          // If adding to the front results in a larger difference (meaning it's less 'minimized' in this context, but following original logic).
          finalCollection.unshift(sourceCollection.shift()); // Add to the beginning of the final collection.
          if (finalCollection.length !== targetSize) {
            // If the target size is not yet reached, add another element to the end.
            finalCollection.push(sourceCollection.shift());
          }
        } else {
          // If adding to the end results in a smaller or equal difference.
          finalCollection.push(sourceCollection.shift()); // Add to the end of the final collection.
          if (finalCollection.length !== targetSize) {
            // If the target size is not yet reached, add another element to the beginning.
            finalCollection.unshift(sourceCollection.shift());
          }
        }
      }
      currentStrategy = 'max'; // Switch the strategy for the next iteration.
    } else { // currentStrategy === 'max'
      // If the current strategy is 'max', prioritize maximizing the difference.
      if (finalCollection.length === 0) {
        // If the final collection is empty, simply add the last element from the source.
        finalCollection.push(sourceCollection.pop()); // Remove and add the last element.
      } else {
        // Compare the absolute difference if the last source element is added to the front vs. the end.
        if (Math.abs(finalCollection[0] - sourceCollection[sourceCollection.length - 1]) > Math.abs(finalCollection[finalCollection.length - 1] - sourceCollection[sourceCollection.length - 1])) {
          // If adding to the front results in a larger difference.
          finalCollection.unshift(sourceCollection.pop()); // Add to the beginning of the final collection.
          if (finalCollection.length !== targetSize) {
            // If the target size is not yet reached, add another element to the end.
            finalCollection.push(sourceCollection.pop());
          }
        } else {
          // If adding to the end results in a smaller or equal difference.
          finalCollection.push(sourceCollection.pop()); // Add to the end of the final collection.
          if (finalCollection.length !== targetSize) {
            // If the target size is not yet reached, add another element to the beginning.
            finalCollection.unshift(sourceCollection.pop());
          }
        }
      }
      currentStrategy = 'min'; // Switch the strategy for the next iteration.
    }
  }
  return finalCollection; // Return the fully constructed collection.
}

// The primary function that processes the input data to find the maximum difference.
function processInputData(rawData) {
  // Split the raw input string by newline characters and convert each part to an integer.
  const parsedNumbers = rawData.split("\n").map(parseInteger);

  // The first number in the input indicates the size of the collection to be processed.
  const collectionSize = parsedNumbers[0];

  // Initialize the main collection with the numbers following the size indicator.
  const currentCollection = [];
  for (let elementIndex = 0; elementIndex < collectionSize; elementIndex++) {
    currentCollection.push(parsedNumbers[elementIndex + 1]);
  }

  let maximumDifferenceFound = 0; // Variable to keep track of the highest difference encountered.

  // Perform a fixed number of iterations (shuffles and difference calculations).
  for (let iterationCount = 0; iterationCount < 10000; iterationCount++) {
    // Apply the Fisher-Yates shuffle algorithm to randomize the current collection.
    // Iterate backwards from the last element to the first.
    for (let elementIndex = currentCollection.length - 1; elementIndex >= 0; elementIndex--) {
      // Generate a random index within the current unsorted portion of the array.
      const randomIndex = Math.floor(Math.random() * (elementIndex + 1));

      // Swap the element at the current index with the element at the random index.
      const temporaryValue = currentCollection[elementIndex];
      currentCollection[elementIndex] = currentCollection[randomIndex];
      currentCollection[randomIndex] = temporaryValue;
    }

    // Calculate the sum of absolute differences for the newly shuffled collection.
    const currentDifference = calculateAbsoluteDifferencesSum(currentCollection);

    // If the current difference is greater than the maximum found so far, update the maximum.
    if (currentDifference > maximumDifferenceFound) {
      maximumDifferenceFound = currentDifference;
    }
  }

  // Output the highest absolute difference sum found across all shuffles.
  console.log(maximumDifferenceFound);
}

// Read the input from standard input synchronously and pass it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
