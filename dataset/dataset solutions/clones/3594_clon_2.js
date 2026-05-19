function calculateMidpoint(dataCollection) {
  // This function determines a "middle" element from a given array.
  // It first creates a shallow copy of the input array to avoid modifying the original,
  // then sorts it lexicographically (as per JavaScript's default string sort behavior).
  // Finally, it returns the element found at the floor of half its length.
  // For even-sized arrays, this will be the element at the lower of the two middle indices.
  const sortedCollection = [...dataCollection].sort();

  // Calculate the index for the middle element.
  const middleIndex = Math.floor(sortedCollection.length / 2);

  // Return the element at the computed middle position.
  return sortedCollection[middleIndex];
}

function ProcessInputData(rawData) {
  // The primary function to handle the entire data processing workflow.

  // First, split the incoming raw string data into individual lines.
  const linesOfInput = rawData.split("\n");

  // Parse the first line to extract the total number of elements, converting it to an integer.
  const elementCount = parseInt(linesOfInput[0], 10);

  // Split the second line by spaces to get an array of string-represented numbers.
  const numericStrings = linesOfInput[1].split(" ");

  // Initialize an empty array to store the "medians" of all generated subarrays.
  const subArrayMedians = [];

  // Begin nested loops to generate all possible contiguous subarrays.
  // The outer loop iterates through all possible starting positions.
  for (let outerIndex = 0; outerIndex < elementCount; outerIndex++) {
    // The inner loop iterates through all possible ending positions for subarrays,
    // ensuring that each subarray has at least two elements (innerIndex starts from outerIndex + 1).
    for (let innerIndex = outerIndex + 1; innerIndex < elementCount + 1; innerIndex++) {
      // Extract the current subarray using the slice method.
      const currentSubarray = numericStrings.slice(outerIndex, innerIndex);

      // Calculate the "median" of this subarray using our helper function
      // and add it to our list of collected medians.
      subArrayMedians.push(calculateMidpoint(currentSubarray));
    }
  }

  // After processing all subarrays, calculate the "median" of the collected medians
  // and output the final result to the console.
  console.log(calculateMidpoint(subArrayMedians));
}

// This line reads the content of standard input synchronously,
// converts it to a UTF-8 string, and then passes it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
