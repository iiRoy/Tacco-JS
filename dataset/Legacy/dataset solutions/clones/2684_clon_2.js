function ProcessInput(rawData) {
  // Split the entire input string by newline characters
  rawData = rawData.split('\n');

  // Parse the first line to get the count of elements
  let countOfElements = parseInt(rawData[0], 10);

  // Split the second line to get the array of heights
  let heightsArray = rawData[1].split(' ');

  // Initialize a flag to 'Yes', indicating a valid sequence initially
  let resultFlag = 'Yes';

  // Iterate through the heights array from right to left, excluding the first element
  for (let idx = countOfElements - 1; idx > 0; idx--) {
    // Check if the previous height is significantly greater than the current height
    if (heightsArray[idx - 1] - heightsArray[idx] > 1) {
      // If so, the sequence is invalid
      resultFlag = 'No';
      // Exit the loop early as the condition is met
      break;
    } else if (heightsArray[idx - 1] - heightsArray[idx] === 1) {
      // If the previous height is exactly one greater, decrement it
      heightsArray[idx - 1] = heightsArray[idx - 1] - 1;
    }
  }

  // Display the final outcome
  console.log(resultFlag);
}

// The following line should not be modified (reads input and calls the main function)
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
