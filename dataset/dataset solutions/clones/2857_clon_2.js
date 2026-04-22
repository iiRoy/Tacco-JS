// This JavaScript function calculates the minimal absolute difference between the sums of two continuous subarrays
// formed by splitting a primary array of numerical values at various points.
function processInputData(sourceContent) {
  // The first line of the input string provides the total count of numerical elements.
  const totalItemCount = parseInt(sourceContent.split('\n')[0], 10);

  // The second line contains space-separated numerical values, which are parsed into an array of numbers.
  const numericValues = sourceContent.split('\n')[1].split(' ').map((strValue) => parseFloat(strValue));

  // A collection to store the absolute differences obtained from each possible array partition.
  let absoluteDifferences = [];

  // Iterate through all possible indices where the array can be divided.
  // The 'dividerIndex' ranges from 1 up to 'totalItemCount - 1', ensuring both segments are non-empty.
  for (let dividerIndex = 1; dividerIndex < totalItemCount; dividerIndex++) {
    let firstSegmentSum = 0.0; // Sum for the elements before the divider.
    let secondSegmentSum = 0.0; // Sum for the elements from the divider onwards.

    // Calculate the sum of the elements in the first part of the array.
    for (let currentLeftIndex = 0; currentLeftIndex < dividerIndex; currentLeftIndex++) {
      firstSegmentSum += numericValues[currentLeftIndex];
    }

    // Calculate the sum of the elements in the second part of the array.
    for (let currentRightIndex = dividerIndex; currentRightIndex < totalItemCount; currentRightIndex++) {
      secondSegmentSum += numericValues[currentRightIndex];
    }

    // Store the absolute value of the difference between the two segment sums.
    absoluteDifferences.push(Math.abs(firstSegmentSum - secondSegmentSum));
  }

  // Print the smallest absolute difference found across all possible divisions to the console.
  console.log(Math.min.apply(null, absoluteDifferences));
}

// Execute the data processing function using content read from standard input.
processInputData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));