function ProcessInput(rawData) {
  // Split the raw input string into individual lines.
  rawData = rawData.split("\n");

  // Parse the first line to get the count of elements.
  var elementCount = parseInt(rawData[0]);

  // Parse the second line to get an array of integer values.
  var valueArray = rawData[1].split(" ").map(val => parseInt(val));

  // Initialize a variable to store the final computed result.
  var finalResult = 0;

  // Create a 2D array (memoization table) for dynamic programming.
  var memoTable = new Array(elementCount);

  // Create an array to store prefix sums of the valueArray.
  var prefixSums = new Array(elementCount);

  // Set the first prefix sum.
  prefixSums[0] = valueArray[0];

  // Initialize the memoTable and compute remaining prefix sums.
  for (var idxA = 0; idxA < elementCount; idxA++) {
    // Create a new row for the memoTable, filled with zeros.
    var rowInit = new Array(elementCount).fill(0);
    memoTable[idxA] = rowInit;

    // Calculate prefix sum for the current index if not the first element.
    if (idxA > 0) {
      prefixSums[idxA] = prefixSums[idxA - 1] + valueArray[idxA];
    }
  }

  // Main dynamic programming loop to fill the memoTable.
  // 'spanLength' represents the length of the current sub-problem segment.
  for (var spanLength = 1; spanLength < elementCount; spanLength++) {
    // 'idxA' is the starting index of the segment, 'idxB' is the ending index.
    for (var idxA = 0, idxB = spanLength; idxA < elementCount && idxB < elementCount; idxA++, idxB++) {
      // Initialize currentMinCost with a very large number (effectively infinity).
      var currentMinCost = Math.pow(10, 19);

      // Iterate through all possible split points within the current segment.
      for (var splitPoint = idxA; splitPoint < idxB; splitPoint++) {
        // Calculate the sum of elements in the current segment.
        var segmentSum;
        if (idxA !== 0) {
          segmentSum = prefixSums[idxB] - prefixSums[idxA - 1];
        } else {
          segmentSum = prefixSums[idxB];
        }

        // Update currentMinCost using the DP recurrence relation.
        currentMinCost = Math.min(currentMinCost, memoTable[idxA][splitPoint] + memoTable[splitPoint + 1][idxB] + segmentSum);
      }
      // Store the minimum cost for the current segment in the memoTable.
      memoTable[idxA][idxB] = currentMinCost;
    }
  }

  // The final answer is stored at memoTable[0][elementCount - 1].
  finalResult = memoTable[0][elementCount - 1];

  // Output the computed result to the console.
  console.log('%s', finalResult);

  // Return the final result.
  return finalResult;
}

// This function is for debugging and testing purposes, typically used in a browser environment.
function testSolution(testCaseNum) {
  // Retrieve input from a DOM element.
  var testInput = document.getElementById("input" + testCaseNum).value;

  // Execute the main processing function with the test input.
  var computedAnswer = ProcessInput(testInput);

  // Initialize the test outcome as "Wrong Answer".
  var testOutcome = "WA";

  // Compare the computed answer with the expected output from a DOM element.
  if (computedAnswer == document.getElementById("output" + testCaseNum).value.split("\n")[0]) {
    testOutcome = "AC"; // Set to "Accepted" if they match.
  }

  // Display the test outcome in a designated DOM element.
  document.getElementById("result" + testCaseNum).innerHTML = testOutcome;
}

// Execute the main processing function with input read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
