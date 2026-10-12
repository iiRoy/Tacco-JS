function processInput(rawData) {
  // This function takes raw input string and processes it to find the count of "good" elements.
  // A "good" element is defined as one that is strictly smaller than all preceding elements.

  // First, split the entire input string into an array of lines.
  const lineData = rawData.split('\n');

  // The first line contains a single integer, which represents the total number of elements (N).
  // We extract this number by splitting the first line by space and converting to a Number.
  const [numElements] = lineData[0].split(' ').map(Number);

  // The second line contains N space-separated integers, which are the actual data points (P).
  // These are also parsed into an array of numbers.
  const dataArray = lineData[1].split(' ').map(Number);

  // Initialize a variable to keep track of the smallest element encountered so far.
  // Start with the first element of the data array.
  let currentMinimum = dataArray[0];

  // Initialize a counter for the number of "good" elements.
  // The first element is always considered "good" by definition, so start count at 1.
  let goodCount = 1;

  // Iterate through the data array starting from the second element (index 1).
  // The loop continues as long as the current index is less than the total number of elements.
  for (let idx = 1; idx < numElements; idx++) {
    // Check if the current element in the iteration is strictly less than the current minimum.
    if (currentMinimum > dataArray[idx]) {
      // If the current element is indeed a new minimum, update 'currentMinimum'.
      currentMinimum = dataArray[idx];
      // Increment the 'goodCount' because we found a new element that is smaller than all previous ones.
      goodCount++;
    }
  }

  // After iterating through all elements, print the final count of "good" elements to the console.
  console.log(goodCount);
}

// This part handles reading input from standard input.
// It reads the entire file content, decodes it as UTF-8, and removes any leading/trailing whitespace.
// The processed input string is then passed to the 'processInput' function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
