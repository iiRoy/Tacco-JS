function processInput(rawData) {
  // Remove any leading or trailing whitespace from the entire input string.
  rawData = rawData.trim();

  // Extract the first number from the first line of the input.
  // This number indicates the count of elements expected in the data array.
  const countElements = parseInt(rawData.split(" ")[0], 10);

  // Split the input by newline to get lines, then take the second line (index 1).
  // Split this line by spaces, and convert each resulting string to an integer.
  // Store these parsed integers in a new array called 'dataArray'.
  var dataArray = rawData.split('\n')[1].split(' ').map((elementString) => parseInt(elementString, 10));

  // Sort the 'dataArray' numerically in ascending order.
  // A custom comparison function is used to ensure correct numerical sorting.
  dataArray.sort(function(valueA, valueB) {
    // If the first value is less than the second, it should come before.
    if (valueA < valueB) {
      return -1;
    }
    // If the first value is greater than the second, it should come after.
    if (valueA > valueB) {
      return 1;
    }
    // If values are equal, their relative order does not change.
    return 0;
  });

  // Calculate the difference between two specific elements in the sorted array.
  // The elements are located at indices (countElements / 2) + 1 and (countElements / 2).
  // Note: Array indexing implicitly floors non-integer values, so Math.floor is added for clarity.
  console.log(dataArray[Math.floor(countElements / 2) + 1] - dataArray[Math.floor(countElements / 2)]);
}

// Read the entire content of standard input as a UTF-8 string.
// Then, pass this raw string data to the 'processInput' function for processing.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
