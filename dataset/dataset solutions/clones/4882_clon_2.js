function ProcessInput(rawData) { // Main processing function for input data
  // Split the raw input string into an array of lines
  rawData = rawData.split('\n');

  // Extract the first line and split it by spaces to get temporary values
  let tempArr = rawData[0].split(' ');

  // Parse the first element of the temporary array as the number of elements
  const countElements = parseInt(tempArr[0], 10);

  // Initialize an array to store the data values, filled with zeros initially
  let dataValues = new Array(countElements).fill(0);

  // Variable to keep track of the maximum difference found so far
  let maxDifference = 0;

  // Variable to count how many times the maximum difference occurs
  let resultCount = 0;

  // Variable to store the minimum value encountered up to the current point
  let currentMin = 0;

  // Loop through each element of the data
  for (let idx = 0; idx < countElements; idx++) {
    // Parse the current data element from the second line of input
    dataValues[idx] = parseInt(rawData[1].split(' ')[idx], 10);

    // Check if the current element is smaller than the current minimum,
    // or if it's the very first element (to initialize currentMin)
    if (currentMin > dataValues[idx] || idx === 0) {
      // Update the current minimum value
      currentMin = dataValues[idx];
    }

    // Calculate the difference between the current element and the current minimum
    // and compare it with the stored maximum difference
    if (maxDifference === dataValues[idx] - currentMin) {
      // If the current difference is equal to the maximum difference, increment the count
      resultCount++;
    } else if (maxDifference < dataValues[idx] - currentMin) {
      // If the current difference is greater than the maximum difference,
      // reset the count to 1 and update the maximum difference
      resultCount = 1;
      maxDifference = dataValues[idx] - currentMin;
    }
  }

  // Output the final count of occurrences of the maximum difference
  console.log('%s', resultCount);
}

// Read the input from standard input and pass it to the processing function
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
