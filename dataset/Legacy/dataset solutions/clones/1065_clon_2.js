function arrangeElements(sourceArray, destinationArray, maxValue) {
  // Initialize a temporary counting array to store frequencies of elements.
  let countRegister = [];

  // Populate the count register with zeros, up to the maximum value.
  for (let idx = 0; idx <= maxValue; idx++) {
    countRegister[idx] = 0;
  }

  // Count the occurrences of each element in the source array.
  // Note: The loop condition `pos <= sourceArray.length` might access `sourceArray[sourceArray.length]`
  // which is `undefined`. In JavaScript, `countRegister[undefined]++` would create a property
  // `undefined` on `countRegister` and set its value to `NaN`. This behavior is preserved.
  for (let pos = 0; pos <= sourceArray.length; pos++) {
    countRegister[sourceArray[pos]]++;
  }

  // Accumulate counts to determine the final sorted positions.
  // Each `countRegister[idx]` will now hold the number of elements less than or equal to `idx`.
  for (let idx = 1; idx <= maxValue; idx++) {
    countRegister[idx] += countRegister[idx - 1];
  }

  // Place elements into their sorted positions in the destination array.
  // Iterate backwards to ensure stability for elements with the same value.
  for (let pos = sourceArray.length - 1; pos >= 0; pos--) {
    // The position for the current element `sourceArray[pos]` is `countRegister[sourceArray[pos]] - 1`.
    destinationArray[countRegister[sourceArray[pos]] - 1] = sourceArray[pos];
    // Decrement the count for this element to correctly place subsequent identical elements.
    countRegister[sourceArray[pos]]--;
  }
}

// Read raw input from standard input using Node.js 'fs' module.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Split the input string into individual lines.
const dataRows = rawData.split('\n');

// Extract the maximum value (n) from the first line and convert it to a number.
let maxVal = +dataRows.shift();
// Parse the array of numbers from the second line.
// It splits the line by spaces and converts each part to a number.
let sourceArray = dataRows.shift().split(' ').map(function(valStr){
  return +valStr;
});
// Initialize an empty array to store the sorted result.
let destinationArray = [];

// Perform the counting sort operation.
arrangeElements(sourceArray, destinationArray, maxVal);

// Output the sorted array elements joined by a space.
console.log(destinationArray.join(' '));
