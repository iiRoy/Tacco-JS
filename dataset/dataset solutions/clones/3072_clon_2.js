'use strict';

// This function processes raw input data to calculate a specific value.
function ProcessInput(rawData) {
  // Parse the input string into an array of numbers, splitting by newline.
  const numericValues = rawData.split('\n').map(Number);

  // Remove the last element, which is typically an empty string from the final newline.
  numericValues.pop();

  // The first remaining number is the target value.
  let targetValue = numericValues[0];

  // Remove the target value from the array, leaving only the other numbers.
  numericValues.shift();

  // Debugging: Check initial parsed data.
  // console.log({ targetValue, numericValues });

  // Sort the remaining numeric values in ascending order.
  numericValues.sort((first, second) => first - second);

  /* After sorting, verify the order. */
  // console.log({ targetValue, numericValues });

  // Calculate a 'bottleneck' value using the target and the smallest remaining number.
  let bottleneckCalc = Math.ceil(targetValue / numericValues[0]);

  // Add a constant offset to the bottleneck value to get the final result.
  let finalResult = bottleneckCalc + 4;

  // Output the computed final result to the console.
  console.log(finalResult);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
