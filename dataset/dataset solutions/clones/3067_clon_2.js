function processInput(inputData) {
  // Split the incoming string data by newline characters
  inputData = inputData.split('\n');

  // This array is declared but not used in the original logic.
  // It's kept for structural similarity as per Type II rules.
  const temporaryArray = [];

  // Process each line to create pairs of numbers
  // The first number is the original value, the second is its last digit (or 10 if it's a multiple of 10)
  let processedNumbers = inputData.map(currentLine => {
    const numericValue = Number(currentLine);
    if (numericValue % 10 === 0) {
      return [numericValue, 10]; // If divisible by 10, use 10 as the second element
    }
    return [numericValue, numericValue % 10]; // Otherwise, use the last digit
  });

  // Sort the processed number pairs based on their second element in ascending order
  processedNumbers.sort((elementA, elementB) => elementA[1] - elementB[1]);

  // Initialize a variable to accumulate the final sum
  var finalSum = 0;

  // Iterate through the sorted number pairs to calculate the total sum
  processedNumbers.forEach((currentItem, currentIndex) => {
    // For the very first item, add its original value directly
    if (currentIndex === 0) {
      finalSum += currentItem[0];
    } else {
      // For subsequent items, round up to the nearest multiple of 10 and add
      finalSum += Math.ceil(currentItem[0] / 10) * 10;
    }
  });

  // Output the computed final sum to the console
  console.log(finalSum);
}

// Read input from standard input and pass it to the main processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
