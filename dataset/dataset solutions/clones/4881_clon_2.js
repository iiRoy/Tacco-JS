// This function processes a block of raw text data to find a specific pattern.
function ProcessInputData(streamContent) {
  // Split the entire input string into individual lines based on newline characters.
  streamContent = streamContent.split('\n');

  // The first line contains parameters for the subsequent data.
  // We extract the first part of the first line, which indicates the number of elements.
  const firstLineTokens = streamContent[0].split(' ');
  let elementCount = parseInt(firstLineTokens[0], 10); // Convert string to integer, specify radix.

  // The second line holds the actual numeric sequence as strings.
  const secondLineValues = streamContent[1].split(' ');

  // Initialize an array to store the parsed numbers.
  let dataCollection = new Array(elementCount);

  // Variables to track the maximum observed difference and its frequency.
  let peakDifference = 0;   // Stores the largest difference found so far.
  let resultCount = 0;      // Counts how many times 'peakDifference' has been achieved.
  let runningMinimum = 0;   // Keeps track of the minimum value encountered up to the current point.

  // Iterate through the collected numeric data.
  for (let currentIdx = 0; currentIdx < elementCount; currentIdx++) {
    // Parse the current string value into an integer and store it.
    dataCollection[currentIdx] = parseInt(secondLineValues[currentIdx], 10);

    // Update the running minimum if the current element is smaller,
    // or if it's the very first element (to properly initialize 'runningMinimum').
    if (runningMinimum > dataCollection[currentIdx] || currentIdx === 0) {
      runningMinimum = dataCollection[currentIdx];
    }

    // Calculate the difference between the current element and the running minimum.
    const currentCalculatedDifference = dataCollection[currentIdx] - runningMinimum;

    // Compare this difference with the 'peakDifference'.
    if (peakDifference === currentCalculatedDifference) {
      // If the current difference matches the peak, increment its occurrence count.
      resultCount++;
    } else if (peakDifference < currentCalculatedDifference) {
      // If the current difference is greater than the peak,
      // reset the count to 1 and update the peak difference.
      resultCount = 1;
      peakDifference = currentCalculatedDifference;
    }
  }

  // Output the final count of occurrences of the maximum difference.
  console.log(String(resultCount));
}

// Entry point: Read data from standard input and pass it to the processing function.
// Ensure 'fs' module is available for file system operations.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));