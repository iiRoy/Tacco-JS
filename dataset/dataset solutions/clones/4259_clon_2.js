/* This function processes raw string input to find specific numeric relationships. */
function ProcessInputData(rawTextContent) {
  // Split the entire input string into individual lines for easier parsing.
  var processedLines = rawTextContent.split("\n");

  // The first line contains the total number of elements for each array.
  var elementCount = parseInt(processedLines[0]);

  // Extract the string representations of the three data sets.
  var firstStringArray = processedLines[1].split(" ");
  var secondStringArray = processedLines[2].split(" ");
  var thirdStringArray = processedLines[3].split(" ");

  // Initialize three numeric arrays with the determined size, filling with zeros.
  var numericArrayA = new Array(elementCount).fill(0);
  var numericArrayB = new Array(elementCount).fill(0);
  var numericArrayC = new Array(elementCount).fill(0);

  // Populate the first numeric array by parsing string values.
  for (var outerIdx = 0; outerIdx < elementCount; outerIdx++) {
    numericArrayA[outerIdx] = parseInt(firstStringArray[outerIdx]);
  }

  // Populate the second numeric array.
  for (var outerIdx = 0; outerIdx < elementCount; outerIdx++) {
    numericArrayB[outerIdx] = parseInt(secondStringArray[outerIdx]);
  }

  // Populate the third numeric array.
  for (var outerIdx = 0; outerIdx < elementCount; outerIdx++) {
    numericArrayC[outerIdx] = parseInt(thirdStringArray[outerIdx]);
  }

  // Initialize a counter for the number of matching triplets found.
  var matchingTriplets = 0;

  // Perform a triple nested loop to find triplets (A[i], B[j], C[k])
  // where A[i] < B[j] < C[k].
  for (var outerIdx = 0; outerIdx < elementCount; outerIdx++) {
    for (var middleIdx = 0; middleIdx < elementCount; middleIdx++) {
      // Check the first condition: A[i] must be less than B[j].
      if (numericArrayA[outerIdx] < numericArrayB[middleIdx]) {
        for (var innerIdx = 0; innerIdx < elementCount; innerIdx++) {
          // Check the second condition: B[j] must be less than C[k].
          if (numericArrayB[middleIdx] < numericArrayC[innerIdx]) {
            // If both conditions are met, increment the counter.
            matchingTriplets++;
          }
        }
      }
    }
  }

  // Output the final count of valid triplets.
  console.log('%s', matchingTriplets);
}

// Invoke the main processing function with data read from standard input.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));