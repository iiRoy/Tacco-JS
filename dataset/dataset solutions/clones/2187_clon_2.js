function processInput(inputString) {
  // Split the incoming string by spaces to create an array of values.
  // The original parameter variable is reused to store this array.
  inputString = inputString.split(' ');

  // Output the array of parsed values to the console.
  console.log(inputString);

  // Initialize a variable to keep track of the number of operations performed.
  let iterationCounter = 0;

  // Extract the first value from the array, which represents the initial amount.
  // JavaScript will implicitly convert this string to a number during arithmetic.
  let remainingValue = inputString[0];

  // Extract the second value from the array, which represents the amount to subtract.
  // This will also be implicitly converted to a number when used in calculations.
  let subtractionValue = inputString[1];

  // Continue looping as long as the value to subtract is less than or equal to the remaining amount.
  while (subtractionValue <= remainingValue) {
    // Perform the subtraction, reducing the remaining amount.
    remainingValue = remainingValue - subtractionValue;
    // Increment the counter for each successful subtraction.
    iterationCounter++;
  }

  // Display the final count of successful subtractions to the console.
  console.log(iterationCounter);
}

// Read the entire content of standard input as a UTF-8 string
// and then pass it to our main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
