const fileSystemModule = require('fs');

// Helper function to determine how many times a number can be divided by 2
function countDivisionsByTwo(valueToAnalyze) {
  let currentWorkingValue = valueToAnalyze;
  let divisionCounter = 0;
  // Continue dividing by 2 as long as the number is even
  while (currentWorkingValue % 2 === 0) {
    currentWorkingValue /= 2;
    divisionCounter++;
  }
  return divisionCounter;
}

// Main processing function
function processInputData(rawInputContent) {
  // Split the entire input string into individual lines
  const allInputLines = rawInputContent.split('\n');

  // The first line contains the count of numbers, parsed as an integer
  const numberOfElements = parseInt(allInputLines[0], 10);

  // The second line contains the space-separated numbers as a string
  const numbersAsStringArray = allInputLines[1].split(' ');

  // Convert the string array of numbers into an array of integers
  const integerNumbersArray = numbersAsStringArray.map(numStr => parseInt(numStr, 10));

  // Initialize the minimum count of divisions.
  // The original code uses 100, which is a safe upper bound for typical integer inputs.
  let minimumDivisionsFound = 100;

  // Iterate through each number in the parsed array
  // Using a for...of loop for a slightly different iteration style compared to a traditional for loop
  for (const currentNumber of integerNumbersArray) {
    // Calculate the number of times the current number can be divided by 2
    const currentNumberDivisions = countDivisionsByTwo(currentNumber);

    // Update the overall minimum if the current number's division count is smaller
    minimumDivisionsFound = Math.min(minimumDivisionsFound, currentNumberDivisions);
  }

  // Output the final minimum count to the console
  console.log(minimumDivisionsFound);
}

// Read the input from standard input using the file system module
const stdinContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Execute the main processing function with the read content
processInputData(stdinContent);
