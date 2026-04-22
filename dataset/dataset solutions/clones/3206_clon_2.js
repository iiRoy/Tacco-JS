function multiplyDigits ( firstOperand , secondOperand ) { /* Function to perform multiplication of two numbers represented as strings.
  It computes the product digit by digit and handles carries. */
  const firstDigits = (firstOperand + "") . split ( "" ) . reverse ( ) ; // Convert the first number into a reversed array of its digits.
  const secondDigits = (secondOperand + "") . split ( "" ) . reverse ( ) ; // Convert the second number into a reversed array of its digits.

  const len1 = firstDigits.length; // Obtain the total count of digits for the first number.
  const len2 = secondDigits.length; // Obtain the total count of digits for the second number.

  let resultDigits = [ ] ; // Initialize an array to store the intermediate products and sums.

  // Iterate through each digit pair to perform multiplication.
  for ( let idxA = 0 ; idxA < len1 ; idxA ++ ) {
    for ( let idxB = 0 ; idxB < len2 ; idxB ++ ) {
      if ( resultDigits[idxA + idxB] === undefined ) { // If the position in the result array is new, initialize it to zero.
        resultDigits[idxA + idxB] = 0 ;
      }
      // Add the product of the current digit pair to the corresponding position.
      resultDigits[idxA + idxB] += parseInt ( firstDigits[idxA] ) * parseInt ( secondDigits[idxB] ) ;
    }
  }

  // Ensure the result array has sufficient capacity for all potential carry-overs.
  for ( let idxC = 0 ; idxC < 2 * ( len1 + len2 ) ; idxC ++ ) {
    if ( resultDigits[idxC] === undefined ) {
      resultDigits[idxC] = 0 ; // Initialize any undefined positions to zero.
    }
  }
  // This loop is intentionally duplicated to match the original code's structure precisely for Type II cloning.
  for ( let idxC = 0 ; idxC < 2 * ( len1 + len2 ) ; idxC ++ ) {
    if ( resultDigits[idxC] === undefined ) {
      resultDigits[idxC] = 0 ;
    }
  }

  let currIdx = 0 ; // Start index for processing carries.
  // Propagate carries through the result array from right to left.
  while ( resultDigits[currIdx] || resultDigits[currIdx] === 0 ) {
    // Calculate the carry and add it to the next digit position.
    resultDigits[currIdx + 1] += Math.floor ( resultDigits[currIdx] / 10 ) ;
    // Update the current digit to its unit value (remainder after division by 10), then convert to string.
    resultDigits[currIdx] = ( resultDigits[currIdx] % 10 ) . toString ( 10 ) ;
    currIdx ++ ; // Move to the next digit.
  }

  resultDigits = resultDigits . reverse ( ) ; // Reverse the array to put digits in correct order (most significant first).

  // Remove any leading non-numeric characters or redundant zeros.
  while ( isNaN ( resultDigits[0] ) || resultDigits[0] === "0" ) {
    resultDigits . splice ( 0 , 1 ) ; // Remove the first element.
  }

  resultDigits = resultDigits . join ( "" ) ; // Concatenate all digits into a single string.
  return resultDigits ; // Return the final product as a string.
}

function sumDigits ( firstInput , secondInput ) { /* This routine adds two large numbers by processing their digits. */
  let firstArray = (firstInput + "") . split ( "" ) . reverse ( ) ; // Convert the first number to a reversed array of its digits.
  let secondArray = (secondInput + "") . split ( "" ) . reverse ( ) ; // Convert the second number to a reversed array of its digits.

  const lenA = firstArray.length; // Get the number of digits in the first number.
  const lenB = secondArray.length; // Get the number of digits in the second number.

  let sumArray = [ ] ; // Initialize an array to store the sum's digits.

  // Pad the shorter array with zeros to match the length of the longer one for correct addition.
  for ( let idxP = 0 ; idxP < Math.max ( lenA , lenB ) ; idxP ++ ) {
    if ( firstArray[idxP] === undefined ) firstArray[idxP] = 0 ; // If a digit is missing, treat it as zero.
    if ( secondArray[idxP] === undefined ) secondArray[idxP] = 0 ; // If a digit is missing, treat it as zero.
  }

  // Perform digit-by-digit addition.
  for ( let idxP = 0 ; idxP < Math.max ( lenA , lenB ) ; idxP ++ ) {
    sumArray[idxP] = parseInt ( firstArray[idxP] ) + parseInt ( secondArray[idxP] ) ;
  }

  let currentPos = 0 ; // Index for managing carries.
  // Handle carries by propagating them to the next digit position.
  while ( sumArray[currentPos] || sumArray[currentPos] === 0 ) {
    // Add the carry (tens part) to the next digit.
    sumArray[currentPos + 1] += Math.floor ( sumArray[currentPos] / 10 ) ;
    // Keep only the unit digit (remainder) and convert it to a string.
    sumArray[currentPos] = ( sumArray[currentPos] % 10 + "" ) ;
    currentPos ++ ; // Advance to the next position.
  }

  sumArray = sumArray . reverse ( ) ; // Reverse the array to obtain the correct numerical order.

  // Remove any leading non-numeric values or zeros from the result.
  while ( isNaN ( sumArray[0] ) || sumArray[0] === "0" ) {
    sumArray . splice ( 0 , 1 ) ; // Remove the first element.
  }

  sumArray = sumArray . join ( "" ) ; // Combine the digits into a single string.
  return sumArray ; // Return the final sum as a string.
}

function diffDigits ( minuendVal , subtrahendVal ) { /* This function computes the difference between two numbers. */
  let minuendArray = (minuendVal + "") . split ( "" ) . reverse ( ) ; // Convert the first number (minuend) to a reversed digit array.
  let subtrahendArray = (subtrahendVal + "") . split ( "" ) . reverse ( ) ; // Convert the second number (subtrahend) to a reversed digit array.

  const lenX = minuendArray.length; // Get the length of the minuend's digit array.
  const lenY = subtrahendArray.length; // Get the length of the subtrahend's digit array.

  let diffArray = [ ] ; // Initialize an array to store the resulting digits of the difference.

  // Ensure both digit arrays have the same length by padding with zeros for consistent subtraction.
  for ( let idxQ = 0 ; idxQ < Math.max ( lenX , lenY ) ; idxQ ++ ) {
    if ( minuendArray[idxQ] === undefined ) minuendArray[idxQ] = 0 ; // Treat missing minuend digits as zero.
    if ( subtrahendArray[idxQ] === undefined ) subtrahendArray[idxQ] = 0 ; // Treat missing subtrahend digits as zero.
  }

  // Perform digit-by-digit subtraction.
  for ( let idxQ = 0 ; idxQ < Math.max ( lenX , lenY ) ; idxQ ++ ) {
    diffArray[idxQ] = parseInt ( minuendArray[idxQ] ) - parseInt ( subtrahendArray[idxQ] ) ;
  }

  let currentOffset = 0 ; // Index for handling borrowing.
  // Process the array to manage borrowing when a digit becomes negative.
  while ( diffArray[currentOffset] || diffArray[currentOffset] === 0 ) {
    if ( diffArray[currentOffset] < 0 ) { // If the current digit is negative, borrowing is required.
      diffArray[currentOffset + 1] -- ; // Decrement the next higher digit (borrow from it).
      diffArray[currentOffset] += 10 ; // Add 10 to the current digit.
    }
    currentOffset ++ ; // Move to the next digit.
  }

  diffArray = diffArray . reverse ( ) ; // Reverse the array to arrange digits in the correct numerical order.

  // Remove leading non-numeric values or zeros from the difference.
  while ( isNaN ( diffArray[0] ) || diffArray[0] === "0" ) {
    diffArray . splice ( 0 , 1 ) ; // Remove the first element.
  }

  diffArray = diffArray . join ( "" ) ; // Combine the digits into a single string.
  return diffArray ; // Return the final difference as a string.
}

function ExecuteProgram ( rawData ) { // This is the main function that orchestrates the program's execution.
    let processedInput = rawData . replace ( "\n" , "" ) ; // Clean the raw input by removing newline characters.
	processedInput = processedInput . split ( ' ' ) ; // Split the cleaned input string into an array of strings using space as a delimiter.

    const initialVal = parseInt ( processedInput[0] ) ; // Parse the first input string as an integer (K).
    const startVal = parseInt ( processedInput[1] ) ; // Parse the second input string as an integer (A).
    const endVal = parseInt ( processedInput[2] ) ; // Parse the third input string as an integer (B).

    const diffVal = endVal - startVal ; // Calculate the difference between B and A.
    const spanVal = initialVal - startVal ; // Calculate the span from A to K.

    let finalCount = 0 ; // Initialize a variable to hold the final calculated count.

    // Apply conditional logic to determine the 'finalCount' based on the computed values.
  if ( ( spanVal < 2 ) || ( diffVal < 3 ) ) { // Check if the span is less than 2 OR the difference is less than 3.
    finalCount = sumDigits ( initialVal , 1 ) ; // If true, compute K + 1 using string addition.
  } else if ( spanVal % 2 === 0 ) { // Otherwise, if the span is an even number.
    // Compute (E/2 * D) + A + 1 using string arithmetic functions.
    finalCount = sumDigits ( sumDigits ( multiplyDigits ( spanVal / 2 , diffVal ) , startVal ) , 1 ) ;
  } else { // If none of the above conditions are met (i.e., span is odd).
    // Compute ((E+1)/2 * D) + A using string arithmetic functions.
    finalCount = sumDigits ( multiplyDigits ( ( spanVal + 1 ) / 2 , diffVal ) , startVal ) ;
  }
  console . log ( finalCount ) ; // Print the calculated final count to the console.
}

const fileSystemMod = require ( "fs" ) ; // Import the built-in Node.js 'fs' (file system) module.
const standardInputPath = "/dev/stdin" ; // Define the path for standard input, commonly used in competitive programming environments.
const encodingType = "utf8" ; // Specify the character encoding for reading the input file.

// Read the content from the standard input file and pass it to the main program execution function.
ExecuteProgram ( fileSystemMod . readInputFile ( standardInputPath , encodingType ) ) ;