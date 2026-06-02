// This function processes raw input text into an array of arrays, optionally converting elements to integers.
function parseInputData(rawData, convertToInt) {
  // If the conversion flag is not explicitly provided, default it to false.
  if (typeof convertToInt === 'undefined') {
    convertToInt = false;
  }

  let parsedLines = []; // This array will store the processed data.
  const inputLines = rawData.split('\n'); // Split the entire input string into individual lines.

  // Iterate through each line of the input.
  for (let lineIdx = 0; lineIdx < inputLines.length; lineIdx += 1) {
    if (convertToInt) {
      // If integer conversion is requested, split the line by spaces and map each part to an integer.
      parsedLines.push(inputLines[lineIdx].split(' ').map(function(valStr) {
        return parseInt(valStr, 10); // Use base 10 for integer parsing.
      }));
    } else {
      // Otherwise, just split the line by spaces and keep the parts as strings.
      parsedLines.push(inputLines[lineIdx].split(' '));
    }
  }
  return parsedLines; // Return the structured array of arrays.
}

// Creates and initializes a new array for dynamic programming calculations.
function initializeDynamicArray(arraySize, initialValue) {
  // The array size is N+2 to accommodate 0-based indexing and potential boundary conditions.
  return Array(arraySize + 2).fill(initialValue);
}

// A utility function to find the minimum of two values and update the first.
function checkAndMinimize(currentVal, compareVal) {
  if (currentVal > compareVal) {
    currentVal = compareVal; // Update currentVal if compareVal is smaller.
  }
}

// A utility function to find the maximum of two values and update the first.
function checkAndMaximize(currentVal, compareVal) {
  if (currentVal < compareVal) {
    currentVal = compareVal; // Update currentVal if compareVal is larger.
  }
}

// The main function that orchestrates the program's logic.
function ProcessData(programInput) {
  // Parse the input data, ensuring all numbers are converted to integers.
  const processedData = parseInputData(programInput, true);
  // Extract the target number (N) from the first element of the first processed line.
  const targetNumber = processedData[0][0];

  // Collect all "forbidden" numbers from the subsequent lines of input.
  let forbiddenNumbers = [];
  for (let currentStep = 1; currentStep < processedData.length; currentStep += 1) {
    forbiddenNumbers.push(processedData[currentStep][0]);
  }

  // Initialize the dynamic programming array with zeros.
  let dynamicProgression = initializeDynamicArray(targetNumber, 0);
  // Set the base case: there is one way to reach step 0 (by doing nothing).
  dynamicProgression[0] = 1;

  // Iterate from step 1 up to the target number to fill the DP array.
  for (let currentStep = 1; currentStep <= targetNumber; currentStep += 1) {
    // Check if the current step is one of the forbidden numbers.
    if (forbiddenNumbers[0] === currentStep) {
      forbiddenNumbers.shift(); // Remove the processed forbidden number from the list.
      continue; // Skip this step as it's forbidden.
    }

    // Add the number of ways to reach the previous step (currentStep - 1).
    dynamicProgression[currentStep] += dynamicProgression[currentStep - 1];
    // If currentStep is at least 2, also add the number of ways to reach step (currentStep - 2).
    if (currentStep >= 2) {
      dynamicProgression[currentStep] += dynamicProgression[currentStep - 2];
    }
    // Apply modulo operation to keep the result within a specific range (prevent overflow).
    dynamicProgression[currentStep] %= 1000000007;
  }

  // Print the final calculated number of ways to reach the target number.
  console.log(dynamicProgression[targetNumber]);
}

// Read the input from standard input and pass it to the main processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
