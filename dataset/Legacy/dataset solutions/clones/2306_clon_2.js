// This function processes an array of numerical inputs to calculate a specific sum.
// It's designed to handle data structured in a particular way for a problem.
function ProcessData(rawData) {
  // Extract the count limit from the first sub-array of the input.
  const limitCount = rawData[0][1];

  // Retrieve the main array of values from the second sub-array.
  const valueArray = rawData[1];

  // Generate a new list by combining elements from 'valueArray'.
  // This involves doubling each element and summing pairs of elements.
  const combinedValues = valueArray.reduce((accumulatorList, currentElement, outerIndex) => {
    // First, add the current element doubled to the accumulator.
    accumulatorList.push(currentElement * 2.0);

    // Then, iterate through subsequent elements to form pairs.
    let pairSum;
    for (let innerIndex = outerIndex + 1; innerIndex < valueArray.length; innerIndex++) {
      // Calculate the sum of the current element and a subsequent one.
      pairSum = currentElement + valueArray[innerIndex];
      // Add this sum twice to the accumulator.
      accumulatorList.push(pairSum, pairSum);
    }

    // Return the updated list for the next iteration.
    return accumulatorList;
  }, []).sort((valA, valB) => valB - valA); // Sort the final list in descending order.

  // Initialize a variable to store the final computed result.
  let finalResult = 0;

  // Sum the first 'limitCount' elements from the sorted 'combinedValues' list.
  for (let outerIndex = 0; outerIndex < limitCount; outerIndex++) {
    finalResult += combinedValues[outerIndex];
  }

  // Output the final calculated result to the console.
  console.log(finalResult);
}

// Read input from standard input, process it, and pass it to the main processing function.
ProcessData(
  require("fs")
    .readFileSync("/dev/stdin", "utf8") // Read the entire file content as a UTF-8 string.
    .trim() // Remove leading/trailing whitespace.
    .split('\n') // Split the string into an array of lines.
    .map((lineContent) =>
      lineContent.split(' ').map(Number) // For each line, split by space and convert parts to numbers.
    )
);
