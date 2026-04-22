function bitwiseXorOperation(val1, val2) {
 // This function performs a custom XOR-like calculation on two input values.
 // It splits numbers into upper and lower parts based on a large divisor.

 const largeDivisor = 10000000; // Define a significant constant for segmentation

 var upperPartResult = ( parseInt(val1 / largeDivisor) ^ parseInt(val2 / largeDivisor) ) * largeDivisor;
 // Calculate the XOR of the integer parts, then scale it back up.

 var lowerPartResult = ( val1 % largeDivisor ) ^ ( val2 % largeDivisor );
 // Calculate the XOR of the remainder parts.

 if ( val1 < largeDivisor && val2 < largeDivisor ) {
  // If both numbers are smaller than the divisor, only the lower part matters.
  return lowerPartResult;
 }

 if ( val1 < largeDivisor ) {
  // If only the first number is smaller, adjust the upper part based on the second number.
  upperPartResult = parseInt(val2 / largeDivisor) * largeDivisor;
 }

 if ( val2 < largeDivisor ) {
  // If only the second number is smaller, adjust the upper part based on the first number.
  upperPartResult = parseInt(val1 / largeDivisor) * largeDivisor;
 }

 return lowerPartResult + upperPartResult;
 // Combine the adjusted lower and upper parts for the final outcome.
}

function processInputData(rawInputText) {
 // This is the primary function that processes the given text input.

 const parsedLines = rawInputText.split('\n');
 // Break down the entire input string into an array of lines.

 const startValue = parseInt(parsedLines[0].split(' ')[0]);
 // Extract the first numerical parameter from the initial line.

 const endValue = parseInt(parsedLines[0].split(' ')[1]);
 // Extract the second numerical parameter from the initial line.

 const numberElements = endValue - startValue + 1;
 // Determine the total count of numbers in the range [startValue, endValue].


 if ( numberElements % 2 == 0 ) {
  // Scenario where the total number of elements is even.

  if ( startValue % 2 == 0 ) {
   // Sub-scenario: the starting value is also even.

   if ( (numberElements / 2) % 2 == 0 ) {
    // Check if half the count is even.
    console.log(0);
   } else {
    // If half the count is odd.
    console.log(1);
   }

  } else {
   // Sub-scenario: the starting value is odd.

   var combinedFlag = (numberElements / 2) % 2;
   // Initialize a temporary flag based on half the element count.

   if ( numberElements == 2 ) {
    // Specific adjustment for exactly two elements.
    combinedFlag = 0;
   }
   if ( numberElements > 2 ) {
    // Further adjustment for more than two elements.
    combinedFlag = ( (numberElements - 2) / 2 ) % 2;
   }

   console.log(bitwiseXorOperation(bitwiseXorOperation(startValue, endValue), combinedFlag));
   // Compute and display the result using nested custom XOR operations.
  }

 } else {
  // Scenario where the total number of elements is odd.

  if ( startValue % 2 == 0 ) {
   // Sub-scenario: the starting value is even.

   var combinedFlag = (numberElements / 2) % 2;
   // Initialize a flag based on half the element count.

   if ( numberElements == 1 ) {
    // Adjustment for a single element.
    combinedFlag = 0;
   }
   if ( numberElements > 1 ) {
    // Adjustment for more than one element.
    combinedFlag = ( (numberElements - 1) / 2 ) % 2;
   }

   console.log(bitwiseXorOperation(endValue, combinedFlag));
   // Compute and display the result using the custom XOR.

  } else {
   // Sub-scenario: the starting value is odd.

   var combinedFlag = ( (numberElements - 1) / 2 ) % 2;
   // Determine the flag value for this specific condition.

   console.log(bitwiseXorOperation(startValue, combinedFlag));
   // Compute and display the result using the custom XOR with the starting value.
  }
 }
}

processInputData( require('fs').readFileSync('/dev/stdin', 'utf8') );
// Begin execution by reading input from standard input using the file system module.