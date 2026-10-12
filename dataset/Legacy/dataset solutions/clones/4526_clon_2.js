function ProcessData(rawData) {
  // This function processes the input data to find the range.

  // Extract the number of elements from the first line.
  let countElements = rawData.split('\n')[0];

  // Extract the array of string elements from the second line.
  let elementStrings = rawData.split('\n')[1].split(' ');

  // Sort the array of elements in ascending order.
  let sortedElements = elementStrings.sort();

  // Calculate the difference between the largest and smallest elements.
  // The largest element is at index (countElements - 1) after sorting.
  // The smallest element is at index 0 after sorting.
  let rangeValue = parseInt(sortedElements[parseInt(countElements, 10) - 1], 10) - parseInt(sortedElements[0], 10);

  // Output the calculated range to the console.
  console.log(rangeValue);
}

// Invoke the main processing function with data read from standard input.
ProcessData(require('fs').readFileSync('/dev/stdin', 'utf8'));
