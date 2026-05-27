// This global array will store the sequence of elements for each test case.
let dataArray = [];

// This global variable will hold the effective size of the array (excluding sentinels).
let arraySize = 0;

/**
 * Fills the first available empty slot (represented by 0) in the dataArray
 * with the specified character. It skips the sentinel 'X' elements at the ends.
 * @param {string} charToPlace The character ('A', 'B', 'C', 'D') to insert.
 */
function fillFirstEmpty(charToPlace) {
  // Iterate through the main part of the array, ignoring the boundary sentinels.
  for (let currentIdx = 1; currentIdx < dataArray.length - 1; currentIdx++) {
    // If an empty slot (value 0) is encountered, place the character and exit.
    if (dataArray[currentIdx] === 0) {
      dataArray[currentIdx] = charToPlace;
      return;
    }
  }
}

/**
 * Attempts to place 'B' in an empty slot that is not adjacent to 'A' on either side.
 * It searches from right to left. If no such slot is found, it defaults to
 * placing 'B' in the first available empty slot using fillFirstEmpty.
 */
function placeB() {
  // Search for a suitable empty spot, starting from the right and moving left.
  // We exclude the sentinel positions (0 and dataArray.length - 1).
  for (let currentPosition = dataArray.length - 2; currentPosition >= 1; currentPosition--) {
    // Check if the current position is empty (0) AND its neighbors are not 'A'.
    if (dataArray[currentPosition - 1] !== "A" && dataArray[currentPosition] === 0 && dataArray[currentPosition + 1] !== "A") {
      dataArray[currentPosition] = "B"; // Place 'B' in this valid spot.
      return; // Operation complete.
    }
  }
  // If no specific spot meeting the criteria is found, use the general placement function.
  fillFirstEmpty("B");
}

/**
 * Attempts to place 'C' in an empty slot adjacent to an already occupied slot.
 * It prioritizes placing 'C' to the right of an occupied slot, then to the left.
 * If no such adjacent empty slot is found, 'C' is placed in a specific middle position
 * based on the array's original size (arraySize).
 */
function placeC() {
  // Iterate through the array to find an empty slot next to an occupied one.
  for (let currentElementIndex = 1; currentElementIndex < dataArray.length - 1; currentElementIndex++) {
    // Check if the current element is occupied and the element to its right is empty.
    if (dataArray[currentElementIndex] !== 0 && dataArray[currentElementIndex + 1] === 0) {
      dataArray[currentElementIndex + 1] = "C"; // Place 'C' in the empty slot to the right.
      return; // Task finished.
    }
    // Check if the current element is occupied and the element to its left is empty.
    if (dataArray[currentElementIndex] !== 0 && dataArray[currentElementIndex - 1] === 0) {
      dataArray[currentElementIndex - 1] = "C"; // Place 'C' in the empty slot to the left.
      return; // Task finished.
    }
  }

  // If no adjacent empty slot was found, place 'C' in a calculated middle position.
  if (arraySize % 2 === 1) {
    // For an odd array size, place 'C' slightly to the right of the true center.
    dataArray[(arraySize - 1) / 2 + 1] = "C";
  } else {
    // For an even array size, place 'C' in the right-middle position.
    dataArray[arraySize / 2 + 1] = "C";
  }
}

/**
 * Finds the longest contiguous block of empty slots (0s) that is bounded by 'X' sentinels
 * and not by 'A', 'B', 'C', or 'D'. It then places 'D' at the starting position of this
 * longest suitable block. If no such block is found, it defaults to placing 'D' in the
 * first available empty slot using fillFirstEmpty.
 */
function placeD() {
  // longestBlockInfo stores [start_index_of_block, effective_length_of_block_minus_one].
  let longestBlockInfo = [0, 0];

  // Iterate through the array to find potential starting points of empty blocks.
  for (let currentPosition = 1; currentPosition < dataArray.length - 1; currentPosition++) {
    // If the current spot is not empty, skip it.
    if (dataArray[currentPosition] !== 0) {
      continue;
    }

    let leftPointer = currentPosition;
    let rightPointer = currentPosition;
    let currentBlockLength = 0; // This counts steps outwards from currentPosition.

    // Expand outwards from the current empty spot to determine block boundaries and suitability.
    while (true) {
      // Move the left pointer inwards if it hasn't hit an 'X' sentinel.
      if (dataArray[leftPointer] !== "X") {
        leftPointer--;
      }
      // Move the right pointer outwards if it hasn't hit an 'X' sentinel.
      if (dataArray[rightPointer] !== "X") {
        rightPointer++;
      }

      // If both pointers have reached 'X' sentinels, the block's extent is defined.
      if (dataArray[leftPointer] === "X" && dataArray[rightPointer] === "X") {
        break; // Exit the inner loop.
      }

      // If either pointer encounters an 'A', 'B', 'C', or 'D', this block is not suitable for 'D'.
      if (/[ABCD]/.test(dataArray[leftPointer]) || /[ABCD]/.test(dataArray[rightPointer])) {
        break; // Exit the inner loop, discard this block.
      }

      currentBlockLength++; // Increment the count of expansions.
      // Update the longest suitable block found so far.
      if (longestBlockInfo[1] < currentBlockLength) {
        longestBlockInfo = [currentPosition, currentBlockLength];
      }
    }
  }

  // If a suitable longest block was identified (its effective length is greater than 0).
  if (longestBlockInfo[1] !== 0) {
    // Place 'D' at the starting index of the longest block.
    dataArray[longestBlockInfo[0]] = "D";
    return; // Operation complete.
  }
  // If no suitable block was found, use the general placement function.
  fillFirstEmpty("D");
}

// Standard input reading setup.
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Process the raw input: trim whitespace and split into individual lines.
const lineSegments = rawInputData.trim().split("\n");

// Main loop to process multiple test cases.
while (true) {
  // Extract the array size (n) and command count (m) from the current line.
  const dimensions = lineSegments.shift().split(" ").map(Number);
  arraySize = dimensions[0]; // Update the global array size.
  const commandCount = dimensions[1];

  // If both n and m are zero, it's the termination condition for the program.
  if (arraySize === 0 && commandCount === 0) {
    break;
  }

  // Initialize the data array for the current test case with 'n' zeros.
  dataArray = []; // Reset the global array.
  for (let k = 0; k < arraySize; k++) {
    dataArray.push(0);
  }
  // Add 'X' sentinels at both ends to simplify boundary checks in functions.
  dataArray.unshift("X");
  dataArray.push("X");

  // Process each command for the current test case.
  for (let commandIndex = 0; commandIndex < commandCount; commandIndex++) {
    const currentCommand = lineSegments.shift(); // Get the next command string.
    // Call the appropriate function based on the command.
    if (currentCommand === "A") {
      fillFirstEmpty("A");
    }
    if (currentCommand === "B") {
      placeB();
    }
    if (currentCommand === "C") {
      placeC();
    }
    if (currentCommand === "D") {
      placeD();
    }
  }

  // Remove the 'X' sentinels from the dataArray before output.
  dataArray.shift();
  dataArray.pop();

  // Join the array elements into a single string and replace any remaining '0's with '#'.
  // Then, print the resulting string to the console.
  console.log(dataArray.join("").replace(/0/g, "#"));
}
