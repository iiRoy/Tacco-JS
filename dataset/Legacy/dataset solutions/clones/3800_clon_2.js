function ProcessInput(rawData) {
  // The raw input string is split into an array of lines, re-assigning the parameter.
  rawData = rawData.split("\n");

  // The first line of input is parsed to determine the total number of elements.
  var elementCount = parseInt(rawData[0]);

  // Two arrays are initialized with the determined size.
  // Note: 'secondArray' is declared but not utilized, mirroring the original's structure.
  firstArray = new Array(elementCount);
  secondArray = new Array(elementCount);

  // The second line of input is split by spaces to get individual string values.
  tempValues = rawData[1].split(" ");

  // The 'firstArray' is populated by converting the temporary string values to integers.
  for (outerIndex = 0; outerIndex < elementCount; outerIndex++) {
    firstArray[outerIndex] = parseInt(tempValues[outerIndex]);
  }

  // A counter for the final result is initialized with the total element count.
  var resultCounter = elementCount;

  // This outer loop iterates through each possible starting point for a sub-sequence.
  for (outerIndex = 0; outerIndex < elementCount; outerIndex++) {
    // For each sub-sequence, an XOR sum and an arithmetic sum are initialized with the current element.
    var xorAccumulator = firstArray[outerIndex];
    var sumAccumulator = firstArray[outerIndex];

    // This inner loop extends the current sub-sequence by adding subsequent elements.
    for (innerIndex = outerIndex + 1; innerIndex < elementCount; innerIndex++) {
      // Both the XOR sum and the arithmetic sum are updated with the next element.
      xorAccumulator ^= firstArray[innerIndex];
      sumAccumulator += firstArray[innerIndex];

      // If the XOR sum is equal to the arithmetic sum, the result counter is incremented.
      if (xorAccumulator == sumAccumulator) {
        resultCounter++;
      }
    }
  }

  // The final calculated result is printed to the console.
  console.log('%s', resultCounter);
}

// This auxiliary function is intended for local debugging, typically in a browser environment.
function testFunction() {
  var testInput = document.getElementById("input").value;
  ProcessInput(testInput);
}

// The primary processing function is invoked with input read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
