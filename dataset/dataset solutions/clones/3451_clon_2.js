function processInput(rawData) {
  // Clean up the raw input string by removing leading/trailing whitespace
  rawData = rawData.trim();

  // Parse the number of elements (N) from the first part of the input
  const countElements = parseInt(rawData.split(" ")[0], 10);

  // Extract the initial temperature (T) from the second line
  const initialTemp = parseInt(rawData.split("\n")[1].split(" ")[0], 10);

  // Extract the target altitude (A) from the second line
  const targetAltitude = parseInt(rawData.split("\n")[1].split(" ")[1], 10);

  // Parse the array of heights from the third line
  const heightsData = rawData.split('\n')[2].split(' ').map((val) => parseInt(val, 10));

  // This array will store the absolute differences
  const diffsCollection = [];

  // Iterate through each height to calculate the difference
  for (let idx = 0; idx < countElements; idx++) {
    // Calculate the absolute difference between the adjusted temperature and target altitude
    const currentDifference = Math.abs((initialTemp - heightsData[idx] * 6e-3) - targetAltitude);
    diffsCollection.push(currentDifference); // Add the calculated difference to our collection
  }

  // Find the minimum difference in the collection
  const minimumDifference = Math.min.apply(null, diffsCollection);

  // Output the 1-based index of the height that resulted in the minimum difference
  console.log(diffsCollection.indexOf(minimumDifference) + 1);
}

// Read input from stdin and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
