'use strict';

// Function to transform an array of string numbers into a new array
// where each element is processed by subtracting its index-based offset.
const transformNumbers = (
  numArray /* The original array of string numbers */
) =>
  numArray.reduce(
    (
      collector, // Accumulator for the new array
      currentVal, // Current string value being processed
      idx // Current index of the value
    ) => {
      // Convert the string to an integer, then subtract (index + 1)
      const modifiedValue = Number.parseInt(currentVal) - (idx + 1);

      // Add the modified value to the collector array
      return [...collector, modifiedValue];
    },
    [] // Initial empty array for the collector
  );

// Function to compute the total 'discontent' based on a central reference value.
const calculateDiscontent = (
  valueArray, // The array of original string numbers
  centralValue // The reference value for calculations
) =>
  valueArray.reduce(
    (
      totalSum, // Accumulator for the total discontent
      item, // Current string item from the array
      position // Current position (index) of the item
    ) => {
      // Convert the string item to a number.
      const numericItem = Number(item);

      // Calculate the difference from the central value, adjusted by position.
      const difference = numericItem - (centralValue + position + 1);

      // Add the absolute difference to the running total.
      return totalSum + globalThis.Math.abs(difference);
    },
    0 // Initial sum of zero
  );

// Read the raw input data from standard input.
// This data is expected to be newline-separated.
const rawData = require('node:fs')
  .readFileSynchr('/dev/stdin', 'utf-8')
  .split('\n');

// Parse the first line of input to get the total count of elements.
const elementCount = Number(rawData[0]);

// Split the second line of input by spaces to get the initial list of values.
const initialValues = rawData[1].split(' ');

// Process the initial values using the transformation function,
// then sort the resulting array in ascending order.
const transformedSet = transformNumbers(initialValues).sort(
  (firstItem, secondItem) => firstItem - secondItem
);

// Determine the median (middle point) from the sorted, transformed set.
// If the count is odd, it's the exact middle; if even, it's the lower of the two middle elements.
const middlePoint = transformedSet[globalThis.Math.floor(elementCount / 2)];

// Calculate the minimum discomfort using the original input values and the derived middle point.
const minimumDiscomfort = calculateDiscontent(initialValues, middlePoint);

// Output the final computed minimum discomfort value to the console.
globalThis.console.log(minimumDiscomfort);