// This script processes numerical input to calculate a specific sum or return an error.
console.log((function(inputData) {
  // Parse the input string into numerical arrays.
  // The first line contains countElements, the number of elements for the main loop.
  // The second line contains the initialValues array.
  const [
    [countElements],
    initialValues
  ] = inputData
    .trim()
    .split('\n')
    .map(function(lineStr) {
      return lineStr.split(' ').map(function(valStr) {
        return valStr | 0; // Convert string to integer using bitwise OR 0
      });
    });

  // Initialize a new array 'processedArray' based on 'initialValues'.
  // The first element is derived from the first element of 'initialValues'.
  const processedArray = [1 - initialValues[0]];

  // Populate 'processedArray' using a forward iteration.
  // Each element depends on the previous one and the corresponding 'initialValues' element.
  for (let idx = 1; idx < countElements; idx++) {
    processedArray.push(processedArray[idx - 1] * 2 - initialValues[idx]);
  }

  // Append a zero to the end of 'processedArray'. This acts as a sentinel or boundary value.
  processedArray.push(0);

  // Initialize 'finalSum' with the element at index 'countElements' from 'initialValues'.
  // This implies 'initialValues' has at least 'countElements + 1' elements.
  let finalSum = initialValues[countElements];

  // Iterate backwards through the arrays to adjust 'processedArray' and accumulate 'finalSum'.
  for (let idx = countElements - 1; idx >= 0; idx--) {
    // Calculate a comparison value 'currentCheck' using elements from 'processedArray' and 'initialValues'.
    const currentCheck = processedArray[idx + 1] + initialValues[idx + 1];

    // Apply conditional logic to modify 'processedArray[idx]'.
    if (processedArray[idx] > currentCheck) {
      processedArray[idx] = currentCheck;
    } else if (processedArray[idx] * 2 < currentCheck) {
      // If a specific condition is met, the algorithm cannot proceed, so return an error string.
      return '-1';
    }

    // Accumulate to 'finalSum' using the current 'processedArray' element and 'initialValues' element.
    finalSum += processedArray[idx] + initialValues[idx];
  }

  // Return the final calculated sum as a string.
  return `${finalSum}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8'))); // Read input from standard input.
