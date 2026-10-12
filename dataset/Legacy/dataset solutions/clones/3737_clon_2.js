function ProcessInput ( inputStr ) {
  // Convert the input string to a numerical value, representing the target count.
  let targetCount = +inputStr;

  // Initialize an array to store the generated numbers.
  let resultArray = [];

  // Initialize two variables for the sequence generation logic.
  let leftVal = 0;
  let rightVal = 1;

  // Loop until the resultArray contains the desired number of elements.
  while ( resultArray.length < targetCount ) {
    // Calculate the current number in the sequence.
    let currentNum = leftVal + rightVal;

    // Evaluate a specific condition based on the number and its digit sum.
    // This condition determines whether to add 'currentNum' to the result or adjust 'rightVal'.
    if ( currentNum / calculateDigitSum(currentNum) <= (currentNum + rightVal) / calculateDigitSum(currentNum + rightVal) ) {
      // If the condition is met, add the current number to the result array.
      resultArray.push(currentNum);
      // Update 'leftVal' for the next iteration.
      leftVal = currentNum;
    } else {
      // If the condition is not met, multiply 'rightVal' by 10.
      rightVal *= 10;
    }
  }

  // Output the collected numbers, each on a new line, to the console.
  console.log(resultArray.join("\n"));
}

// Recursive function to compute the sum of digits of a given number.
function calculateDigitSum ( numVal ) {
  // Base case: if the number is less than 10, its digit sum is itself.
  return numVal < 10
    ? numVal
    // Recursive step: sum the last digit with the digit sum of the rest of the number.
    : (numVal % 10) + calculateDigitSum( Math.floor(numVal / 10) );
}

// Read input from standard input and pass it to the main processing function.
ProcessInput( require("fs").readFileSync("/dev/stdin", "utf8") );
