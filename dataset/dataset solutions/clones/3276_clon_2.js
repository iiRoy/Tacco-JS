function ProcessInput(rawData) {
  // Split the entire input string by newline characters to get individual lines.
  let processedLines = rawData.split("\n");

  // Parse the first line to determine the total number of elements.
  const countElements = parseInt(processedLines[0], 10);

  // Initialize three arrays; 'arrayGamma' remains unused, mirroring the original.
  let arrayAlpha = new Array(countElements);
  let arrayBeta = new Array(countElements);
  let arrayGamma = new Array(countElements);

  // Split the second and third lines into string arrays based on spaces.
  const tempAlphaStrings = processedLines[1].split(" ");
  const tempBetaStrings = processedLines[2].split(" ");

  // Initialize a dynamic array to store positive differences.
  let positiveDiffs = new Array();
  // Initialize a variable to accumulate negative sums.
  let negativeSum = 0;
  // Initialize the variable that will hold the final calculated result.
  let finalResult = 0;

  // Loop through each element to populate arrays and perform initial calculations.
  for (let idx = 0; idx < countElements; idx++) {
    arrayAlpha[idx] = parseInt(tempAlphaStrings[idx], 10);
    arrayBeta[idx] = parseInt(tempBetaStrings[idx], 10);

    // Calculate the difference between corresponding elements.
    const currentDifference = arrayAlpha[idx] - arrayBeta[idx];

    if (currentDifference > 0) {
      // If the difference is positive, add it to the 'positiveDiffs' list.
      positiveDiffs.push(currentDifference);
    } else {
      // If the difference is zero or negative, add it to 'negativeSum' (only if negative).
      negativeSum += Math.min(0, currentDifference);
      // Increment the result counter for elements where arrayAlpha[idx] is not greater than arrayBeta[idx].
      finalResult++;
    }
  }

  // Invert the sign of the accumulated negative sum.
  negativeSum = -negativeSum;

  // Sort the 'positiveDiffs' array in descending order.
  positiveDiffs.sort(function(valA, valB) {
    return (valB - valA);
  });

  // Initialize an accumulator for the sorted positive differences.
  let currentSum = 0;

  // Iterate through the sorted positive differences to find the minimum required elements.
  for (let idx = 0; idx < positiveDiffs.length; idx++) {
    currentSum += positiveDiffs[idx];

    if (currentSum >= negativeSum) {
      // If the accumulated sum meets or exceeds the target 'negativeSum',
      // add the count of positive differences used (plus one for 0-based index) to the final result.
      finalResult += idx + 1;
      break; // Exit the loop as the condition is met.
    } else if (idx === positiveDiffs.length - 1) {
      // If the loop finishes and the target sum was not reached, set the result to -1.
      finalResult = -1;
    }
  }

  // Output the final calculated result to the console.
  console.log('%s', finalResult);
}

// This function serves as a debugging entry point, typically for browser environments.
function runDebug() {
  // Retrieve input from a specific HTML element.
  const browserInput = document.getElementById("input").value;
  // Call the main processing function with the retrieved input.
  ProcessInput(browserInput);
}

// Execute the main processing function using input read from standard input in a Node.js environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
