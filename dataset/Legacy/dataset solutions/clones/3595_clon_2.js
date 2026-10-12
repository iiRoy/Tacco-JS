const calculateMidpoint = dataList => {
  // Sorts the provided list of elements lexicographically (as strings by default).
  // This matches the behavior of the original code's `sort()` call on string arrays.
  const sortedElements = dataList.sort();
  // Determines the index of the middle element after sorting.
  const centralIndex = Math.floor(sortedElements.length / 2);
  // Returns the element found at the calculated central index.
  return sortedElements[centralIndex];
};

// This is the primary function that processes the entire input.
function ProcessInput(rawData) {
  // Divides the raw input string into an array of individual lines.
  let parsedLines = rawData.split("\n");

  // Extracts the first line, converts it to an integer, representing the total count of elements.
  let totalElementCount = parseInt(parsedLines[0]);

  // Splits the second line into an array of strings, each representing an element.
  let stringElements = parsedLines[1].split(" ");

  // Initializes an empty array to accumulate the medians of all possible subarrays.
  let collectedMedians = [];

  // Outer loop iterates through all possible starting positions for subarrays.
  for (let startIdx = 0; startIdx < totalElementCount; startIdx++) {
    // Inner loop iterates through all possible ending positions for subarrays.
    // The end index is exclusive for `slice`, so `endIdx` goes up to `totalElementCount`.
    for (let endIdx = startIdx + 1; endIdx < totalElementCount + 1; endIdx++) {
      // Extracts a subarray from the `stringElements` array.
      const currentSubarray = stringElements.slice(startIdx, endIdx);
      // Calculates the median of the current subarray and adds it to the collection.
      collectedMedians.push(calculateMidpoint(currentSubarray));
    }
  }

  // After processing all subarrays, calculate the median of the `collectedMedians` array
  // and print the final result to the console.
  console.log(calculateMidpoint(collectedMedians));
}

// Reads the entire content of standard input synchronously and passes it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
