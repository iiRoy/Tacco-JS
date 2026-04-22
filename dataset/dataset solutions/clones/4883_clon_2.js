function ProcessInput ( inputString ) {
  // Split the entire input string into individual lines
  let lines = inputString.split( '\n' );

  // Parse the first line to get the number of elements
  // Note: Using Number.parseInt with radix for robustness.
  lines[0] = lines[0].split( ' ' ).map( strVal => Number.parseInt(strVal, 10) );

  const totalElements = lines[0][0]; // The first number on the first line indicates total count

  // Parse the second line into an array of numeric values
  let numericArray = lines[1].split( ' ' ).map( numStr => Number.parseInt(numStr, 10) );

  let currentMinimum = numericArray[0]; // Initialize the minimum value with the first element
  let maxDifferenceSoFar = 0;            // Keeps track of the largest difference found
  let countOfMaxDiff = 0;                // Counts how many times the maximum difference occurs

  // Iterate through the array starting from the second element
  for ( let idx = 1; idx < totalElements; idx++ ) {
    // Calculate the difference between the current element and the current minimum
    let currentDifference = numericArray[idx] - currentMinimum;

    // Check if the current difference is greater than the previously recorded maximum difference
    if ( currentDifference > maxDifferenceSoFar ) {
      maxDifferenceSoFar = currentDifference; // Update the maximum difference
      countOfMaxDiff = 1;                      // Reset the count as a new maximum is found
    }
    // If the current difference is equal to the maximum difference, increment the counter
    else if ( currentDifference === maxDifferenceSoFar ) {
      countOfMaxDiff++;
    }
    // If the current element is smaller than the current minimum, update the minimum
    else if ( currentMinimum > numericArray[idx] ) {
      currentMinimum = numericArray[idx];
    }
  }

  // Output the final count of occurrences of the maximum difference
  console.log( countOfMaxDiff );
}

// Read input from standard input and pass it to the processing function
ProcessInput( require("fs").readFileSync("/dev/stdin", "utf8") );