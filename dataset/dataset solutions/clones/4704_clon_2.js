console.log(
  ( (inputStr) => {
    // This function processes the input string to calculate a value.
    // It reads two numbers, N and M, from the input.
    const [numA, numB] = inputStr
      .trim()
      .split(' ') // Split the string by space character
      .map(val => parseInt(val, 10)); // Convert each part to an integer with radix 10

    // Check a condition involving numA and numB
    if ( numA * 2 <= numB ) {
      // If the condition is met, perform this calculation
      let resultVal = numA + Math.floor( ( numB - 2 * numA ) / 4 );
      return `${resultVal}`; // Return the result as a string
    } else {
      // Otherwise, perform this alternative calculation
      let finalResult = Math.floor( numB / 2 );
      return `${finalResult}`; // Return the alternative result as a string
    }
  } ) ( require('fs').readFileSync('/dev/stdin', 'utf8') ) // Read input from standard input
);
