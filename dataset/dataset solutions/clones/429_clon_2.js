function processAlpha() {
  // Iterate through the array from the second element to the second-to-last.
  for (let idx = 1; idx < elementList.length - 1; idx++) {
    // If a zero is found, replace it with "A" and exit.
    if (elementList[idx] === 0) {
      elementList[idx] = "A";
      return;
    }
  }
}

function processBeta() {
  // First pass: Iterate backwards from the second-to-last element.
  for (let idx = elementList.length - 2; idx >= 1; idx--) {
    // Check for a specific pattern: non-"A" before, zero at current, non-"A" after.
    if (elementList[idx - 1] !== "A" && elementList[idx] === 0 && elementList[idx + 1] !== "A") {
      elementList[idx] = "B"; // Mark with "B" and exit.
      return;
    }
  }

  // Second pass: If no specific pattern found, iterate forwards.
  for (let idx = 1; idx < elementList.length - 1; idx++) {
    // Find the first zero, replace it with "B" and exit.
    if (elementList[idx] === 0) {
      elementList[idx] = "B";
      return;
    }
  }
}

function processGamma() {
  // Iterate through the array from the second element to the second-to-last.
  for (let idx = 1; idx < elementList.length - 1; idx++) {
    // Check if current is not zero and next is zero.
    if (elementList[idx] !== 0 && elementList[idx + 1] === 0) {
      elementList[idx + 1] = "C"; // Mark next with "C" and exit.
      return;
    }
    // Check if current is not zero and previous is zero.
    if (elementList[idx] !== 0 && elementList[idx - 1] === 0) {
      elementList[idx - 1] = "C"; // Mark previous with "C" and exit.
      return;
    }
  }

  // Special handling based on 'sizeN' parity.
  if (sizeN % 2 === 1) {
    elementList[(sizeN - 1) / 2 + 1] = "C";
  }
  if (sizeN % 2 !== 1) {
    elementList[sizeN / 2 + 1] = "C";
  }
}

function processDelta() {
  // Initialize 'maximumInfo' to track the best position and count.
  let maximumInfo = [0, 0]; // [index, count]

  // Iterate through the array to find potential 'D' placements.
  for (let idx = 1; idx < elementList.length - 1; idx++) {
    // Skip if the current element is not zero.
    if (elementList[idx] !== 0) {
      continue;
    }

    let leftPtr = idx; // Pointer for leftward search.
    let rightPtr = idx; // Pointer for rightward search.
    let countVal = 0; // Counter for 'X' boundaries.

    // Expand outwards from the current zero.
    while (true) {
      // Move left pointer if not at 'X'.
      if (elementList[leftPtr] !== "X") {
        leftPtr--;
      }
      // Move right pointer if not at 'X'.
      if (elementList[rightPtr] !== "X") {
        rightPtr++;
      }

      // If both pointers hit 'X', we've found the boundaries.
      if (elementList[leftPtr] === "X" && elementList[rightPtr] === "X") {
        break;
      }
      // If left pointer hits a non-'X' and non-zero, boundary found.
      if (elementList[leftPtr] !== "X" && elementList[leftPtr] !== 0) {
        break;
      }
      // If right pointer hits a non-'X' and non-zero, boundary found.
      if (elementList[rightPtr] !== "X" && elementList[rightPtr] !== 0) {
        break;
      }

      countVal++; // Increment count for the current span.
      // Update 'maximumInfo' if current span is larger.
      if (maximumInfo[1] < countVal) {
        maximumInfo = [idx, countVal];
      }
    }
  }

  // If a suitable position for 'D' was found, place it.
  if (maximumInfo[0] !== 0 && maximumInfo[1] !== 0) {
    elementList[maximumInfo[0]] = "D";
    return;
  }

  // Fallback: If no specific 'D' position found, place it at the first available zero.
  for (let idx = 1; idx < elementList.length - 1; idx++) {
    if (elementList[idx] === 0) {
      elementList[idx] = "D";
      return;
    }
  }
}

// Read input from standard input.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Split input into lines and trim whitespace.
const lineSegments = rawData.trim().split("\n");

let elementList; // Declare the array that will be modified by functions.
let sizeN; // Declare variable for array size.

// Main processing loop for multiple test cases.
while (true) {
  // Extract N and M values from the first line of the current test case.
  const dimensions = lineSegments.shift().split(" ").map(Number);
  sizeN = dimensions[0];
  const iterationsM = dimensions[1];

  // Check for termination condition (N=0, M=0).
  if (sizeN === 0 && iterationsM === 0) {
    break;
  }

  // Initialize the working array with zeros.
  elementList = [];
  for (let idx = 0; idx < sizeN; idx++) {
    elementList.push(0);
  }

  // Add boundary markers 'X' to the start and end of the array.
  elementList.unshift("X");
  elementList.push("X");

  // Process M operations.
  for (let idx = 0; idx < iterationsM; idx++) {
    const operationType = lineSegments.shift(); // Get the operation type.

    // Call the appropriate function based on the operation type.
    if (operationType === "A") {
      processAlpha();
    }
    if (operationType === "B") {
      processBeta();
    }
    if (operationType === "C") {
      processGamma();
    }
    if (operationType === "D") {
      processDelta();
    }
  }

  // Remove the 'X' boundary markers before output.
  elementList.shift();
  elementList.pop();

  // Join the array elements into a string, replacing '0' with '#', and print.
  console.log(elementList.join("").replace(/0/g, "#"));
}
