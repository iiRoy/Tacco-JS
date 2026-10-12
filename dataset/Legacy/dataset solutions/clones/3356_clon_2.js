function ProcessInput(rawData) {
  // Split the entire input string into individual lines.
  rawData = rawData.split("\n");

  // Parse the first line to get the total count of items.
  var itemCount = parseInt(rawData[0]);

  // Split the second line to get an array of height strings.
  var heightStrings = rawData[1].split(" ");

  // Split the third line to get an array of value strings.
  var valueStrings = rawData[2].split(" ");

  // Initialize a dynamic programming array with zeros.
  // Its size is itemCount + 1 to accommodate heights up to itemCount.
  var dynamicProgression = new Array(itemCount + 1).fill(0);

  // Initialize the variable to store the maximum result found.
  var finalResult = 0;

  // Iterate through each item from 0 to itemCount - 1.
  for (var outerIndex = 0; outerIndex < itemCount; outerIndex++) {
    // Parse the current item's value.
    var currentValue = parseInt(valueStrings[outerIndex]);

    // Parse the current item's height.
    var currentHeight = parseInt(heightStrings[outerIndex]);

    // This variable is declared but not used in the original logic.
    // It's kept for structural equivalence.
    var unusedVar = 0;

    // Calculate a potential new maximum value for the current height.
    var potentialMax = currentValue + dynamicProgression[currentHeight];

    // Iterate from the current height up to itemCount.
    // This loop propagates the potentialMax value.
    for (var innerIndex = currentHeight; innerIndex < itemCount + 1; innerIndex++) {
      // If the potentialMax is greater than the current value in dynamicProgression, update it.
      if (potentialMax > dynamicProgression[innerIndex]) {
        dynamicProgression[innerIndex] = potentialMax;
      } else {
        // If potentialMax is not greater, it means further heights won't be updated either,
        // so we can break out of this inner loop.
        break;
      }
    }

    // Update the overall finalResult with the maximum value found so far at currentHeight.
    finalResult = Math.max(finalResult, dynamicProgression[currentHeight]);
  }

  // Output the final result to the console.
  console.log('%s', finalResult);

  // Return the computed final result.
  return finalResult;
}

// This function is for debugging purposes, typically in a browser environment.
function testFunction(testCaseNum) {
  // Retrieve input from a DOM element.
  var inputData = document.getElementById("input" + testCaseNum).value;

  // Call the main processing function.
  var computedAnswer = ProcessInput(inputData);

  // Initialize the test outcome as "Wrong Answer".
  var testOutcome = "WA";

  // Compare the computed answer with the expected output from a DOM element.
  if (computedAnswer == document.getElementById("output" + testCaseNum).value.split("\n")[0]) {
    // If they match, set the outcome to "Accepted".
    testOutcome = "AC";
  }

  // Display the test outcome in a DOM element.
  document.getElementById("result" + testCaseNum).innerHTML = testOutcome;
}

// Execute the main function with input read from standard input (Node.js environment).
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
