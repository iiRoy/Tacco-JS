const stringToNum = (textValue) => Number.parseInt(textValue, 10);

const convertStringsToNumbers = (stringArray) => {
  // Ensure the input is an array for safety
  if (!Array.isArray(stringArray)) {
    console.error("Input to convertStringsToNumbers must be an array.");
    return [];
  }
  return stringArray.map(stringToNum);
};

// Main entry point for processing the input data
function processInputData(rawData) {
  // Validate raw input string
  if (typeof rawData !== 'string' || rawData.trim() === '') {
    console.error('Input processing error: Provided data is empty or invalid.');
    return; // Exit if input is not valid
  }

  // Split input into lines, filtering out any empty lines
  const inputLines = rawData.split('\n').filter(line => line.trim() !== '');

  // Check for minimum required lines
  if (inputLines.length < 2) {
    console.error('Input processing error: Not enough data lines provided.');
    return;
  }

  // Parse the first line for configuration parameters
  const configValues = convertStringsToNumbers(inputLines[0].split(' '));
  if (configValues.length < 2 || !Number.isInteger(configValues[0]) || !Number.isInteger(configValues[1])) {
    console.error('Input parsing error: Invalid configuration values on the first line.');
    return;
  }
  const elementCount = configValues[0]; // Represents 'n' from original
  const baseCost = configValues[1];     // Represents 'x' from original

  // Parse the second line for the main data points
  const dataPoints = convertStringsToNumbers(inputLines[1].split(' ')); // Represents 'xs' from original

  // Validate the number of data points
  if (dataPoints.length !== elementCount) {
    console.error(`Input parsing error: Expected ${elementCount} data points but received ${dataPoints.length}.`);
    return;
  }

  // Calculate prefix sums (cumulative values) for efficient lookups
  // This corresponds to the 'ss' array in the original code
  const cumulativeValues = new Array(elementCount);
  if (elementCount > 0) {
    cumulativeValues[0] = dataPoints[0];
    for (let idx = 1; idx < elementCount; idx++) {
      cumulativeValues[idx] = dataPoints[idx] + cumulativeValues[idx - 1];
    }
  } else {
    // Handle edge case of zero elements gracefully
    console.warn('Warning: Element count is zero. No data points to process.');
    console.log(0); // Or some default result
    return;
  }

  // Initialize the final calculated score
  let finalCalculatedScore = (elementCount + 1) * baseCost; // Corresponds to 'ans'

  // Iterate backwards through the data points to apply complex logic
  let currentSegmentLength = 0; // Corresponds to 'has'
  for (let idx = elementCount - 1; idx >= 0; idx--) {
    currentSegmentLength++; // Increment segment length for current iteration

    // Retrieve current element's value and its cumulative sum up to this point
    const currentElementVal = dataPoints[idx];
    const sumUpToCurrent = cumulativeValues[idx];

    // Evaluate a specific condition based on segment length and values
    // This part is equivalent to `x <= ss[i]*(has-1)*2 - xs[i]*2`
    const comparisonThreshold = sumUpToCurrent * (currentSegmentLength - 1) * 2 - currentElementVal * 2;

    if (currentSegmentLength > 2 && baseCost <= comparisonThreshold) {
      currentSegmentLength = 1; // Reset segment length if condition met
      finalCalculatedScore += baseCost; // Add base cost to score
    }

    // Calculate a multiplier for the current element's value
    // This is equivalent to `max(has,2)*2 + 1`
    const elementMultiplier = Math.max(currentSegmentLength, 2) * 2 + 1;
    finalCalculatedScore += currentElementVal * elementMultiplier;
  }

  // Output the final computed result
  console.log(finalCalculatedScore);
}

// Read input from standard input and initiate processing
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));