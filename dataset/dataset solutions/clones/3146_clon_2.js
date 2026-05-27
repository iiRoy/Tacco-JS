function performCustomXOR(firstOperand, secondOperand) {
  // Define a large magnitude divisor for splitting numbers
  const magnitudeDivisor = 10000000;

  // Calculate the XOR for the upper parts of the numbers
  let tempUpper = (parseInt(firstOperand / magnitudeDivisor) ^ parseInt(secondOperand / magnitudeDivisor)) * magnitudeDivisor;
  // Calculate the XOR for the lower parts (remainder) of the numbers
  let tempLower = (firstOperand % magnitudeDivisor) ^ (secondOperand % magnitudeDivisor);

  // Handle edge cases where one or both numbers are smaller than the divisor
  if (firstOperand < magnitudeDivisor && secondOperand < magnitudeDivisor) {
    return tempLower;
  }
  if (firstOperand < magnitudeDivisor) {
    tempUpper = parseInt(secondOperand / magnitudeDivisor) * magnitudeDivisor;
  }
  if (secondOperand < magnitudeDivisor) {
    tempUpper = parseInt(firstOperand / magnitudeDivisor) * magnitudeDivisor;
  }

  // Combine the lower and upper XOR results
  return tempLower + tempUpper;
}

function processData(rawInputData) {
  // Split the raw input string into an array of lines
  const inputLines = rawInputData.split('\n');
  // Parse the first number from the first line
  const startNumber = parseInt(inputLines[0].split(' ')[0]);
  // Parse the second number from the first line
  const endNumber = parseInt(inputLines[0].split(' ')[1]);
  // Calculate the total count of elements in the range [startNumber, endNumber]
  const totalElements = endNumber - startNumber + 1;

  // Check if the total count of elements is even
  if (totalElements % 2 === 0) {
    // If the starting number is even
    if (startNumber % 2 === 0) {
      // If half the count is even, result is 0
      if ((totalElements / 2) % 2 === 0) {
        console.log(0);
      } else {
        // Otherwise, result is 1
        console.log(1);
      }
    } else {
      // If the starting number is odd
      let derivedXORValue = (totalElements / 2) % 2;
      // Special handling for totalElements being 2
      if (totalElements === 2) {
        derivedXORValue = 0;
      }
      // Special handling for totalElements greater than 2
      if (totalElements > 2) {
        derivedXORValue = ((totalElements - 2) / 2) % 2;
      }
      // Perform custom XOR operations and print the final result
      console.log(performCustomXOR(performCustomXOR(startNumber, endNumber), derivedXORValue));
    }
  } else {
    // If the total count of elements is odd
    if (startNumber % 2 === 0) {
      // If the starting number is even
      let derivedXORValue = (totalElements / 2) % 2;
      // Special handling for totalElements being 1
      if (totalElements === 1) {
        derivedXORValue = 0;
      }
      // Special handling for totalElements greater than 1
      if (totalElements > 1) {
        derivedXORValue = ((totalElements - 1) / 2) % 2;
      }
      // Perform custom XOR and print the result
      console.log(performCustomXOR(endNumber, derivedXORValue));
    } else {
      // If the starting number is odd
      let derivedXORValue = ((totalElements - 1) / 2) % 2;
      // Perform custom XOR and print the result
      console.log(performCustomXOR(startNumber, derivedXORValue));
    }
  }
}

// Read input from standard input and pass it to the main processing function
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
