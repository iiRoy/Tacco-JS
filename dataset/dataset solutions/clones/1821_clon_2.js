const systemInput = require('fs')
  .readFileSync('/dev/stdin', 'utf8')
  .trim()
  .split(/\s+/); // Retrieve and parse all incoming data

const totalElements = parseInt(systemInput[0]); // Determine the total number of entries

const minBoundaryValues = Array(totalElements); // Initialize an array for minimum boundaries
const maxBoundaryValues = Array(totalElements); // Initialize an array for maximum boundaries

let elementIterator = 0; // Index for current element being processed
let inputPointer = 1; // Pointer for reading from the raw input array

// Populate both boundary arrays from the parsed input
for (elementIterator = 0; elementIterator < totalElements; ++elementIterator) {
  minBoundaryValues[elementIterator] = parseInt(systemInput[inputPointer++]); // Assign lower bound
  maxBoundaryValues[elementIterator] = parseInt(systemInput[inputPointer++]); // Assign upper bound
}

const numericalComparator = (valX, valY) => valX - valY; // A utility function for ascending numerical sort

minBoundaryValues.sort(numericalComparator); // Sort the array of minimum values
maxBoundaryValues.sort(numericalComparator); // Sort the array of maximum values

// Check if the total count of elements is an even number
if (totalElements % 2 === 0) {
  // Case for an even number of entries
  const leftMidIndex = totalElements / 2 - 1; // Calculate the index of the left-middle element
  const rightMidIndex = totalElements / 2; // Calculate the index of the right-middle element

  const highestMedianSum = maxBoundaryValues[leftMidIndex] + maxBoundaryValues[rightMidIndex]; // Sum of two middle elements for upper bounds
  const lowestMedianSum = minBoundaryValues[leftMidIndex] + minBoundaryValues[rightMidIndex]; // Sum of two middle elements for lower bounds

  // Output the final computed range size
  console.log(highestMedianSum - lowestMedianSum + 1);
} else {
  // Case for an odd number of entries
  const centralIndex = (totalElements - 1) / 2; // Determine the single central element's index

  const highestCentralValue = maxBoundaryValues[centralIndex]; // The upper bound's central value
  const lowestCentralValue = minBoundaryValues[centralIndex]; // The lower bound's central value

  // Output the final computed range size
  console.log(highestCentralValue - lowestCentralValue + 1);
}