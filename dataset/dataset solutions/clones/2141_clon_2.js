function processData(rawData) {
  // Initialize an array to store all parsed elements
  const parsedElements = [];

  // Split the raw input by newlines to get individual lines
  rawData.split('\n').forEach(lineStr => {
    // Split each line by spaces to get individual values
    const elementList = lineStr.split(' ');
    // Iterate over the values in the current line and add them to the main array
    elementList.forEach(elementVal => parsedElements.push(elementVal));
  });

  // Return the collected elements
  return parsedElements;
}

function retrieveData() {
  // A placeholder string, primarily for local testing or if no input is provided
  const placeholder = ``;
  // Read input from /dev/stdin if available, otherwise use the placeholder
  // Then, process the obtained input string
  return processData(placeholder || require('fs').readFileSync('/dev/stdin', 'utf8'));
}

// Function to compute the factorial of a given number
function calculateFactorial(inputNumber) {
  let resultProduct = 1; // Initialize product to 1
  // Loop from 1 up to the input number, multiplying each integer
  for (let counter = 1; counter <= inputNumber; counter++) {
    resultProduct *= counter;
  }
  return resultProduct; // Return the computed factorial
}

// Function to calculate combinations (nCr)
function computeCombination(totalItems, selectedItems) {
  // Formula: nCr = n! / (r! * (n-r)!)
  return calculateFactorial(totalItems) / (calculateFactorial(selectedItems) * calculateFactorial(totalItems - selectedItems));
}

// Self-invoking anonymous function to encapsulate the main program logic
;(function executeProgram() {
  // Get and parse the program's input
  const programInput = retrieveData();

  // Extract numerical values from the parsed input
  const totalCount = +programInput[0]; // N
  const excludedA = +programInput[1];  // A
  const excludedB = +programInput[2];  // B

  let totalSum = 0; // Initialize a variable to accumulate the sum of combinations

  // Iterate from 1 to N (totalCount)
  for (let currentSelection = 1; currentSelection <= totalCount; currentSelection++) {
    // Skip calculation if the current selection count is equal to excludedA or excludedB
    if (currentSelection === excludedA || currentSelection === excludedB) {
      continue; // Move to the next iteration
    }

    // Add the combination (totalCount C currentSelection) to the total sum
    totalSum += computeCombination(totalCount, currentSelection);
  }

  // Define a large prime constant for modulo operation
  const moduloConstant = Math.pow(10, 9) + 7;
  // Output the final sum modulo the constant
  console.log(totalSum % moduloConstant);
})();
