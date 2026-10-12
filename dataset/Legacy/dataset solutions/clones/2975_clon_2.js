// This function serves as a simple wrapper for console logging.
function logMessage(messageContent) {
  console.log(messageContent);
}

// The primary function responsible for processing input and calculating results.
function ProcessInputData(rawData) {
  // Normalize the input string by removing leading/trailing whitespace.
  rawData = rawData.trim();
  // Split the string by spaces and convert each resulting part into a numerical value.
  rawData = rawData.split(" ").map((itemValue) => Number(itemValue));

  // Assign the numerical input values to descriptive variables.
  var redComponent = rawData[0];
  var greenComponent = rawData[1];
  var blueComponent = rawData[2];
  var targetValue = rawData[3];

  // Create an array containing the three component values.
  var componentValues = [redComponent, greenComponent, blueComponent];

  // Determine the largest value among the components.
  var highestComponent = Math.max.apply(null, componentValues);

  // Remove the largest component from the array to simplify finding the next two.
  componentValues.splice(componentValues.indexOf(highestComponent), 1);

  // Calculate the maximum number of times the highest component can be used without exceeding the target.
  var maxIterationsHighest = Math.floor(targetValue / highestComponent);

  // From the remaining two components, identify the larger one (the middle component).
  var middleComponent = Math.max.apply(null, componentValues);

  // The last remaining component is the smallest one.
  var lowestComponent = Math.min.apply(null, componentValues);

  // Initialize a counter for the number of successful combinations found.
  var validCombinations = 0;

  // Begin iterating through all possible counts for the highest component.
  for (var outerLoopIndex = 0; outerLoopIndex <= maxIterationsHighest; outerLoopIndex++) {
    // Calculate the sum that remains after accounting for the current count of the highest component.
    var remainingAfterHighest = targetValue - (outerLoopIndex * highestComponent);

    // Determine the maximum number of times the middle component can be used with the current remaining sum.
    var maxIterationsMiddle = Math.floor(remainingAfterHighest / middleComponent);

    // This conditional block contains commented-out debugging code.
    if (outerLoopIndex === 227) {
      // console.log(remainingAfterHighest); // This line is currently inactive.
    }

    // Iterate through all possible counts for the middle component.
    for (var innerLoopIndex = 0; innerLoopIndex <= maxIterationsMiddle; innerLoopIndex++) {
      // Calculate the sum that remains after accounting for both the highest and middle components.
      var remainingAfterMiddle = remainingAfterHighest - (innerLoopIndex * middleComponent);

      // If the final remaining sum is perfectly divisible by the lowest component, a valid combination is found.
      if (remainingAfterMiddle % lowestComponent === 0) {
        validCombinations++; // Increment the counter for valid combinations.
      }
    }
  }

  // Output the total count of valid combinations to the console.
  console.log(validCombinations);
}

// Read the input data from standard input using the 'fs' module and pass it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
