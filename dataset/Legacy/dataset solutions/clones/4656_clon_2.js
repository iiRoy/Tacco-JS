function processInput(rawData) {
  // Split the raw input string into an array of lines.
  const lines = rawData.split('\n');

  // Parse the first line to get the number of elements.
  const numElements = parseInt(lines[0], 10);

  // Process the second line: split by space, then convert each part to an integer.
  let dataArray = lines[1].split(' ').map(item => parseInt(item, 10));

  // Initialize a variable that is not used but present in the original structure.
  let counterVar = 0;

  // Initialize the variable to store the computed sum or value.
  let finalResult = 0;

  // Sort the array of numbers in ascending order.
  dataArray = dataArray.sort((valA, valB) => valA - valB);

  // Check a specific condition based on the number of elements.
  if (numElements === 1) {
    // If there's only one element, assign the second element (index 1) of the sorted array.
    // Note: This implies the input array will always have at least 2 elements if N=1,
    // or there's an implicit assumption about the problem context.
    finalResult = dataArray[1];
  } else {
    // If there are more elements, iterate and sum specific elements.
    // The loop starts from 'numElements' and goes up to '2 * numElements - 1'.
    for (let idx = numElements; idx <= ((2 * numElements) - 1); idx++) {
      finalResult += dataArray[idx]; // Add the element at the current index to the result.
    }
  }

  // Output the final calculated result to the console.
  console.log(finalResult);
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
