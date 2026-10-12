(function executeProgram() {
  // Read all input lines from standard input, decode as UTF-8, trim whitespace, and split by newline.
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // The first line contains the total number of elements in the array.
  const arraySize = Number(inputLines.shift());

  // The second line contains the space-separated elements of the array, converted to numbers.
  const sourceArray = inputLines.shift().split(' ').map(Number);

  // Define the upper bound for the counting sort range (maximum possible value + 1).
  const rangeLimit = 10000;

  // Initialize a frequency counter array with zeros for each possible value.
  let frequencyMap = [];
  for (let loopIndex = 0; loopIndex < rangeLimit; loopIndex++) {
    frequencyMap[loopIndex] = 0;
  }

  // Populate the frequency map by counting occurrences of each number in the source array.
  for (let loopIndex = 0; loopIndex < arraySize; loopIndex++) {
    frequencyMap[sourceArray[loopIndex]]++;
  }

  // Convert the frequency map into a cumulative frequency map.
  // This map now stores the final position (index + 1) for each number in the sorted array.
  for (let loopIndex = 1; loopIndex < rangeLimit; loopIndex++) {
    frequencyMap[loopIndex] += frequencyMap[loopIndex - 1];
  }

  // Initialize the array that will hold the sorted elements.
  let resultArray = [];

  // Iterate through the original array in reverse order.
  // This ensures stability for elements with the same value.
  // Place each element into its correct sorted position in the resultArray using the cumulative frequency map.
  // The post-decrement operator ensures that duplicate elements are placed correctly.
  for (let loopIndex = arraySize; loopIndex >= 0; loopIndex--) {
    resultArray[frequencyMap[sourceArray[loopIndex]]--] = sourceArray[loopIndex];
  }

  // Join the elements of the sorted array with spaces and write the result to standard output.
  process.stdout.write(resultArray.join(' '));
})();
