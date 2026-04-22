const calculateBinaryDivisibility = (numberValue) => {
  if (Number.isNaN(numberValue) || numberValue === 0) {
    // If the number is 0 or non-numeric (e.g., empty string parsed as 0),
    // it effectively doesn't constrain the minimum divisions for other numbers.
    // In the original code, 0 % 2 == 0 is true, and 0 / 2 is 0.
    // So 0 never becomes odd, and doesn't break the 'every' condition.
    // Thus, its contribution to the 'minimum' should be treated as effectively infinite.
    return Number.MAX_SAFE_INTEGER;
  }

  let shiftCount = 0;
  let currentVal = numberValue;
  // Use bitwise AND to check for evenness and right shift for division by 2.
  // This is a different implementation strategy than modulo and arithmetic division.
  while ((currentVal & 1) === 0) {
    currentVal >>= 1; // Equivalent to integer division by 2
    shiftCount++;
  }
  return shiftCount;
};

const processDataFromSource = (rawInputContent) => {
  // Deconstruct the input string into lines and then elements.
  const allLines = rawInputContent.split('\n');
  const relevantLine = allLines[1];
  const stringComponentList = relevantLine.split(' ');

  // Transform each string component into a number and then into its divisibility count.
  const divisibilityValues = stringComponentList.map(strItem =>
    calculateBinaryDivisibility(Number(strItem))
  );

  // Determine the smallest divisibility count among all elements.
  const smallestDivisionCount = divisibilityValues.reduce((currentMinimum, currentElement) =>
    Math.min(currentMinimum, currentElement)
  , Number.MAX_SAFE_INTEGER); // Initialize with a large number for min comparison

  // Output the final computed value.
  const displayResult = console.log;
  displayResult(smallestDivisionCount);
};

// Retrieve input from the standard input stream and initiate processing.
const systemIOModule = require('fs');
const standardInputContent = systemIOModule.readFileSync('/dev/stdin', 'utf8');

processDataFromSource(standardInputContent);