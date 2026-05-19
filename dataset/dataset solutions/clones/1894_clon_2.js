function ProcessInputData(rawData) {
  // This function processes the provided raw input string.
  // It first splits the input into individual lines.
  rawData = rawData.split("\n");

  // Output the initial array of lines for debugging or tracing.
  console.log(rawData);

  // Extract the primary numerical value from the first line.
  // Assuming it's the first space-separated token.
  let initialValue = rawData[0].split(" ")[0];

  // Initialize an array to store elements that will be processed.
  let processedElements = [];

  // Iterate through the input lines, starting from the third line (index 2)
  // and skipping every other line.
  for (let idx = 2; idx < rawData.length; idx += 2) {
    // Split the current line by spaces to get its constituent parts.
    let currentLineParts = rawData[idx].split(" ");
    // Add each part from the current line to our collection of elements.
    for (let partIdx = 0; partIdx < currentLineParts.length; partIdx++) {
      processedElements.push(currentLineParts[partIdx]);
    }
  }

  // Apply a filtering operation to the collected elements to ensure uniqueness.
  processedElements = FilterUniqueElements(processedElements);
  // Display the array after uniqueness filtering.
  console.log(processedElements);

  // Calculate the final result by subtracting the count of unique elements
  // from the initial numerical value.
  let finalResult = initialValue - processedElements.length;
  // Output the final calculated result.
  console.log(finalResult);

  // Return the computed result.
  return finalResult;
}

// This helper function takes an array and returns a new array
// containing only the unique elements from the input.
function FilterUniqueElements(elementList) {
  // Define a predicate function to determine if an element is unique
  // within the context of its array.
  const isUniquePredicate = (currentVal, currIdx, sourceArr) => {
    // An element is unique if its first occurrence is at the current index.
    return sourceArr.indexOf(currentVal) === currIdx;
  };

  // Use the filter method with the predicate to create an array of distinct elements.
  const distinctElements = elementList.filter(isUniquePredicate);
  // Return the array containing only unique values.
  return distinctElements;
}
