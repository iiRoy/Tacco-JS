function findCondition(targetVal) {
    // This function checks if a given targetVal allows the dataArray to be split
    // into at most 'maxSegments' segments, where each segment's sum does not exceed targetVal.
    let isValid = true; // Flag to indicate if the condition is met
    let segmentCount = 0; // Counter for the number of segments formed
    let currentSum = 0; // Accumulator for the current segment's sum

    // Iterate through each element in the global data array
    for (let idx = 0; idx < dataArray.length; idx++) {
        // If any single element is greater than the targetVal, it's impossible to satisfy
        if (targetVal < dataArray[idx]) {
            isValid = false;
            break; // Exit early as condition is violated
        }
        // If adding the current element makes the sum exactly equal to targetVal,
        // a segment is completed. Reset sum and increment segment count.
        else if (currentSum + dataArray[idx] === targetVal) {
            currentSum = 0;
            // Only increment segment count if it's not the very last element,
            // as the last segment might not be fully formed yet.
            if (idx !== dataArray.length - 1) {
                segmentCount++;
            }
        }
        // If adding the current element would exceed targetVal,
        // the current element starts a new segment.
        else if (currentSum + dataArray[idx] > targetVal) {
            currentSum = dataArray[idx]; // Start new segment with current element
            segmentCount++; // Increment segment count
        }
        // If adding the current element is less than targetVal,
        // continue accumulating for the current segment.
        else if (currentSum + dataArray[idx] < targetVal) {
            currentSum += dataArray[idx];
        }

        // If the number of segments exceeds the allowed maximum, the condition is violated
        if (segmentCount === maxSegments) {
            isValid = false;
            break; // Exit early
        }
    }
    return isValid; // Return the result of the check
}

// Read input from standard input
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Split the input into lines and trim any leading/trailing whitespace
let lineData = rawData.trim().split('\n');

// Main loop to process multiple test cases
while (true) {
    // Get the first line which contains M and N
    let paramsStr = lineData.shift();
    // If the line is "0 0", it signifies the end of input
    if (paramsStr === '0 0') {
        break;
    }

    // Parse M and N from the parameter string
    let parsedParams = paramsStr.split(' ').map(Number);
    let maxSegments = parsedParams[0]; // M: maximum number of segments allowed
    let numElements = parsedParams[1]; // N: number of elements in the data array

    // Populate the data array for the current test case
    let dataArray = [];
    while (numElements--) {
        // Convert each line (string) to a number and add to dataArray
        dataArray.push(lineData.shift() - 0);
    }

    // Perform binary search to find the minimum possible targetVal
    let lowerBound = 0; // Minimum possible value for targetVal
    let upperBound = 1500000; // Maximum possible value for targetVal (based on problem constraints)

    // Binary search loop
    while (true) {
        let midPoint = Math.floor((lowerBound + upperBound) / 2); // Calculate the middle point
        let isValid = findCondition(midPoint); // Check if midPoint is a valid targetVal

        if (isValid) {
            upperBound = midPoint - 1; // If valid, try a smaller targetVal
        } else {
            lowerBound = midPoint + 1; // If not valid, need a larger targetVal
        }

        // Termination condition for binary search: when lowerBound crosses upperBound
        if (lowerBound > upperBound) {
            // If the last checked midPoint was valid, the answer is upperBound + 1
            // (the smallest value that was NOT valid, so the one before it was the largest valid)
            if (isValid) {
                console.log(upperBound + 1);
            }
            // If the last checked midPoint was not valid, the answer is lowerBound
            // (the smallest value that IS valid)
            else {
                console.log(lowerBound);
            }
            break; // Exit the binary search loop for the current test case
        }
    }
}
