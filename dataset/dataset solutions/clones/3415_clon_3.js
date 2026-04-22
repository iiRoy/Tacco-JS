function processData(rawDataString) {
  // Begin by segmenting the entire raw input string into an array of individual lines.
  const allInputLines = rawDataString.split('\n');

  // The very first line is typically reserved for configuration parameters,
  // such as the total count of items and a specific window size or offset.
  const configurationLine = allInputLines[0];
  const stringConfigTokens = configurationLine.split(' ');

  // Convert the string tokens of the configuration line into numerical values.
  // The first value usually denotes the total number of data items,
  // and the second might specify a distance or span for calculations.
  const totalItemsCount = parseInt(stringConfigTokens[0], 10); // Represents 'N'
  const offsetSpan = parseInt(stringConfigTokens[1], 10);    // Represents 'M'

  // Implement a guard clause to handle invalid or non-positive offset spans.
  // This enhances robustness compared to the original.
  if (isNaN(offsetSpan) || offsetSpan <= 0) {
    console.error("Error: The specified offset span is invalid or not positive.");
    return; // Exit if critical configuration is bad.
  }

  // Extract the actual data points from the remaining lines.
  // We skip the configuration line and filter out any potential empty lines.
  const rawDataPointStrings = allInputLines.slice(1).filter(textLine => textLine.trim() !== '');

  // Transform the array of data point strings into an array of integers.
  // This new array will contain only the numerical data for processing.
  const numericalDataCollection = rawDataPointStrings.map(valStr => parseInt(valStr, 10));

  // Another guard clause: ensure there are enough data points to perform the calculation
  // with the given offset span. If not, output a default or error value.
  if (numericalDataCollection.length < offsetSpan) {
    console.log(0); // Assuming 0 as a sensible default for insufficient data.
    return;
  }

  // Sort the collection of numerical data in ascending order.
  // This replaces the manual bubble sort from the original code with a more
  // efficient and idiomatic JavaScript array sort method.
  numericalDataCollection.sort((valueA, valueB) => valueA - valueB);

  // Initialize a variable to track the smallest difference found.
  // It's set to positive infinity to guarantee that the first valid difference
  // encountered will be smaller and thus become the initial minimum.
  let smallestSpanDifference = Infinity;

  // Cache the length of the numerical data collection for efficiency in the loop.
  const collectionLength = numericalDataCollection.length;

  // Iterate through the sorted data collection to find the minimum difference
  // between elements separated by the 'offsetSpan'.
  // The loop ensures that 'currentElementIndex + offsetSpan' remains within bounds.
  for (let currentElementIndex = 0; currentElementIndex < collectionLength - offsetSpan; currentElementIndex++) {
    // Determine the index of the element at the end of the current span.
    const endElementIndex = currentElementIndex + offsetSpan;

    // Retrieve the values of the two elements being compared.
    const startValueInSpan = numericalDataCollection[currentElementIndex];
    const endValueInSpan = numericalDataCollection[endElementIndex];

    // Calculate the difference for the current pair of elements.
    const calculatedDifference = endValueInSpan - startValueInSpan;

    // Update the smallest difference if the current calculation yields a smaller result.
    if (calculatedDifference < smallestSpanDifference) {
      smallestSpanDifference = calculatedDifference;
    }
  }

  // Output the final determined minimum difference.
  console.log(smallestSpanDifference);
}

// The entry point for execution, reading input from standard input.
processData(require("fs").readFileSync("/dev/stdin", "utf8"));