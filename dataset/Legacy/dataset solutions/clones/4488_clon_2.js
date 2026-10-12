function ProcessInput(rawData) {
  // Split the raw input string into lines
  rawData = rawData.split("\n");

  // Parse the first line for configuration parameters (e.g., memory settings)
  // and convert them to numbers.
  var configParams = rawData[0].split(" ").map(Number);

  // Parse the second line for the main data array and convert elements to numbers.
  var dataArray = rawData[1].split(" ").map(Number);

  // Process each element in the data array:
  // Replace each number with its remainder when divided by 2 (0 or 1).
  {
    for (var idx = 0; idx < dataArray.length; idx++) {
      dataArray[idx] %= 2;
    }
  }

  // Initialize a pair of BigInts for accumulating results.
  // The first element starts at 1n, the second at 0n.
  var resultPair = [BigInt(1), BigInt(0)];

  // Iterate through the processed data array to update the result pair.
  for (var idx = 0; idx < dataArray.length; idx++) {
    // If the current array element is 0, double both elements of the result pair.
    if (dataArray[idx] === 0) {
      resultPair[0] *= 2n;
      resultPair[1] *= 2n;
    } else {
      // If the current array element is 1, update both elements of the result pair
      // to be the sum of their previous values.
      var tempSum = resultPair[0] + resultPair[1];
      resultPair[0] = tempSum;
      resultPair[1] = tempSum;
    }
    // Log the current state of the result pair after each iteration.
    console.log(resultPair);
  }

  // After processing all elements, print the final result.
  // The index for the final result is determined by the second configuration parameter.
  console.log(resultPair[configParams[1]].toString());
}

// Read input from standard input, trim whitespace, and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
