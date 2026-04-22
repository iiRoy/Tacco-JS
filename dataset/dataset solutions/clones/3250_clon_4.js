function processDataAlternative(inputContent) {
  const numberPattern = /(\d+(\.\d+)?)/g; // Regular expression to capture numbers (integers or floats)
  let extractedNumbers = [];
  let currentCapture;

  // Use a loop with RegExp.exec to find all numeric values in the input string
  while ((currentCapture = numberPattern.exec(inputContent)) !== null) {
    extractedNumbers.push(parseFloat(currentCapture[1]));
  }

  // If fewer than two numbers are found, the original code would produce NaN
  // (e.g., accessing input[1] on an array with less than two elements results in undefined)
  if (extractedNumbers.length < 2) {
    console.log(NaN);
    return;
  }

  // Manually find the two smallest numbers without using array.sort()
  let lowestValue = Infinity;
  let nextLowestValue = Infinity;

  for (const valueItem of extractedNumbers) {
    if (valueItem < lowestValue) {
      nextLowestValue = lowestValue; // The previous lowest becomes the next lowest
      lowestValue = valueItem;       // The current item is the new lowest
    } else if (valueItem < nextLowestValue) {
      // If not smaller than the lowest, check if it's smaller than the second lowest
      nextLowestValue = valueItem;
    }
  }

  // Perform the final calculation
  const calculatedResult = (lowestValue * nextLowestValue) / 2;
  console.log(calculatedResult);
}

processDataAlternative(require("fs").readFileSync("/dev/stdin", "utf8"));