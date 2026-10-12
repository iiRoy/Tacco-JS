function ProcessInput(inputString) {
  // Split the entire input string into an array of lines
  let inputLines = inputString.split('\n');

  // Parse the first line to get numerical parameters
  inputLines[0] = inputLines[0].split(' ').map(val => parseInt(val, 10));

  // Extract the array length from the parsed first line
  const arrayLength = inputLines[0][0];

  // Parse the second line into an array of integers
  let dataArray = inputLines[1].split(' ').map(element => parseInt(element, 10));

  // Initialize the minimum value with the first element of the data array
  let currentMinimum = dataArray[0];

  // Initialize the maximum difference found so far
  let maxDifference = 0;

  // Initialize the count of occurrences of the maximum difference
  let countMaxDiff = 0;

  // Iterate through the array starting from the second element
  for (let idx = 1; idx < arrayLength; idx++) {
    // Calculate the difference between the current element and the current minimum
    let currentDifference = dataArray[idx] - currentMinimum;

    // If the current difference is greater than the maximum difference found so far
    if (currentDifference > maxDifference) {
      // Update the maximum difference
      maxDifference = currentDifference;
      // Reset the count of maximum differences to 1
      countMaxDiff = 1;
    } else if (currentDifference === maxDifference) {
      // If the current difference is equal to the maximum difference, increment the count
      countMaxDiff++;
    }
    // If the current element is smaller than the current minimum, update the minimum
    else if (currentMinimum > dataArray[idx]) {
      currentMinimum = dataArray[idx];
    }
  }

  // Output the final count of maximum differences
  console.log(countMaxDiff);
}

// Read input from standard input and pass it to the processing function
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
