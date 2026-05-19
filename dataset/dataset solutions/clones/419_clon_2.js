// This function checks if the 'dataElements' array can be processed
// such that the sum of elements in any sequence (segment) does not exceed 'targetVal',
// and the count of such sequences (segments) does not reach 'maxSegments' prematurely.
// It returns true if this condition is met throughout the array, false otherwise.
function findOptimalValue(targetVal) {
  let isPossible = true; // Flag to track feasibility
  let segmentCount = 0; // Counter for segments formed
  let currentSum = 0; // Accumulator for the current segment's sum

  // Iterate through each element in the global data array
  for (let idx = 0; idx < dataElements.length; idx++) {
    // If an individual element is greater than the target, it's impossible
    if (targetVal < dataElements[idx]) {
      isPossible = false;
      break; // Exit early as this targetVal is not feasible
    } else if (currentSum + dataElements[idx] === targetVal) {
      // If adding the current element exactly matches the target,
      // reset sum and increment segment count.
      currentSum = 0;
      segmentCount++;
    } else if (currentSum + dataElements[idx] > targetVal) {
      // If adding the current element exceeds the target,
      // start a new segment with the current element and increment segment count.
      currentSum = dataElements[idx];
      segmentCount++;
    } else if (currentSum + dataElements[idx] < targetVal) {
      // If adding the current element is still within the target,
      // continue accumulating.
      currentSum += dataElements[idx];
    }

    // If the segment count reaches the maximum allowed,
    // this targetVal is not feasible under the current rules.
    if (segmentCount === maxSegments) {
      isPossible = false;
      break; // Exit early
    }
  }
  return isPossible;
}

// Read input from standard input synchronously
const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
// Split the input into lines and trim any leading/trailing whitespace
let lineArray = fileContent.trim().split("\n");

// Main processing loop for multiple test cases
while (true) {
  // Get the first line, which contains M and N for the current test case
  let dimensionsStr = lineArray.shift();

  // Check for termination condition "0 0"
  if (dimensionsStr === "0 0") {
    break;
  }

  // Parse M and N from the string
  dimensionsStr = dimensionsStr.split(" ").map(Number);
  var maxSegments = dimensionsStr[0]; // M: maximum number of segments allowed (global for findOptimalValue)
  var numElements = dimensionsStr[1]; // N: number of elements in the data array

  // Initialize the array for the current test case (global for findOptimalValue)
  var dataElements = [];
  // Populate the dataElements array with N elements, converting them to integers
  while (numElements--) {
    dataElements.push(parseInt(lineArray.shift(), 10));
  }

  // Binary search for the minimum possible maximum segment sum
  let lowerBound = 0;
  let upperBound = 1500000; // A sufficiently large upper bound for the sum, based on problem constraints

  // Perform binary search to find the optimal value
  while (true) {
    let midPoint = Math.floor((lowerBound + upperBound) / 2);

    // If the current midPoint value is a feasible maximum segment sum
    if (findOptimalValue(midPoint)) {
      upperBound = midPoint - 1; // Try a smaller maximum sum
      // If lowerBound crosses upperBound, we found the smallest feasible sum
      if (lowerBound > upperBound) {
        console.log(upperBound + 1); // The answer is upperBound + 1
        break; // Exit binary search
      }
    } else {
      // If midPoint is not feasible, we need a larger maximum sum
      lowerBound = midPoint + 1;
      // If lowerBound crosses upperBound, we found the smallest feasible sum
      if (lowerBound > upperBound) {
        console.log(upperBound + 1); // The answer is upperBound + 1
        break; // Exit binary search
      }
    }
  }
}
