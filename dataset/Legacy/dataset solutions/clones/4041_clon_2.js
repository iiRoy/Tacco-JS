// This function processes the given input data to determine a specific condition.
function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  let parsedLines = rawData.split("\n");

  // Parse the first line to get the number of items.
  const itemCount = parseInt(parsedLines[0], 10);

  // Initialize two arrays with 'itemCount' zeros.
  let arrayA = new Array(itemCount).fill(0);
  let arrayB = new Array(itemCount).fill(0);

  // Split the second and third lines into string arrays.
  const tempArrayAStrings = parsedLines[1].split(" ");
  const tempArrayBStrings = parsedLines[2].split(" ");

  // Initialize accumulator variables for sums and differences.
  let totalA = 0;
  let totalB = 0;
  let absoluteDifferenceSum = 0;
  let positiveDifferenceSum = 0;
  let negativeDifferenceSum = 0;

  // Iterate through the items to populate arrays and calculate sums/differences.
  for (let idx = 0; idx < itemCount; idx++) {
    // Convert string elements to integers and store them.
    arrayA[idx] = parseInt(tempArrayAStrings[idx], 10);
    totalA += arrayA[idx]; // Accumulate sum for array A

    arrayB[idx] = parseInt(tempArrayBStrings[idx], 10);
    totalB += arrayB[idx]; // Accumulate sum for array B

    // Calculate various difference metrics.
    absoluteDifferenceSum += Math.abs(arrayA[idx] - arrayB[idx]);
    positiveDifferenceSum += Math.max(0, arrayB[idx] - arrayA[idx]);
    negativeDifferenceSum += Math.max(0, arrayA[idx] - arrayB[idx]);
  }

  // Initialize the result string.
  let resultString = "No";

  // Evaluate the complex condition based on calculated sums and differences.
  // The condition checks several inequalities involving sums and differences.
  if (
    totalA <= totalB &&
    absoluteDifferenceSum <= (totalB - totalA) * 3 &&
    positiveDifferenceSum <= (totalB - totalA) * 2 &&
    negativeDifferenceSum <= (totalB - totalA) &&
    positiveDifferenceSum / negativeDifferenceSum <= 2
  ) {
    resultString = "Yes"; // If all conditions are met, set result to "Yes".
  }

  // Output the final result string to the console.
  console.log('%s', resultString);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
