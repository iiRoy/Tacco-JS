function applyAlpha() {
  // This routine searches for the first available slot (0)
  // and marks it with 'A', then exits.
  for (let currentIdx = 1; currentIdx < itemSequence.length - 1; currentIdx++) {
    if (itemSequence[currentIdx] === 0) {
      itemSequence[currentIdx] = "A";
      return;
    }
  }
}

function applyBeta() {
  // First, scan backwards for a specific pattern:
  // non-'A' on the left, 0 in the middle, non-'A' on the right.
  // If found, mark the middle with 'B' and return.
  for (let scanIndex = itemSequence.length - 2; scanIndex >= 1; scanIndex--) {
    if (itemSequence[scanIndex - 1] !== "A" && itemSequence[scanIndex] === 0 && itemSequence[scanIndex + 1] !== "A") {
      itemSequence[scanIndex] = "B";
      return;
    }
  }
  // If the specific pattern wasn't found, find the first general available slot (0)
  // and mark it with 'B', then exit.
  for (let scanIndex = 1; scanIndex < itemSequence.length - 1; scanIndex++) {
    if (itemSequence[scanIndex] === 0) {
      itemSequence[scanIndex] = "B";
      return;
    }
  }
}

function applyGamma() {
  // Attempt to place 'C' adjacent to a non-zero element.
  // Prioritize placing to the right, then to the left.
  for (let posIndex = 1; posIndex < itemSequence.length - 1; posIndex++) {
    if (itemSequence[posIndex] !== 0 && itemSequence[posIndex + 1] === 0) {
      itemSequence[posIndex + 1] = "C";
      return;
    }
    if (itemSequence[posIndex] !== 0 && itemSequence[posIndex - 1] === 0) {
      itemSequence[posIndex - 1] = "C";
      return;
    }
  }
  // If no adjacent placement is possible, place 'C' based on sequence size parity.
  if (sequenceSize % 2 === 1) {
    // For odd lengths, place 'C' just past the middle.
    itemSequence[(sequenceSize - 1) / 2 + 1] = "C";
  }
  if (sequenceSize % 2 !== 1) {
    // For even lengths, place 'C' just past the middle.
    itemSequence[sequenceSize / 2 + 1] = "C";
  }
}

function applyDelta() {
  // Variables to track the maximum valid contiguous empty segment.
  let extentData = [0, 0]; // [starting_index, segment_length]

  // Iterate through the array to find potential starting points for empty segments.
  for (let loopPos = 1; loopPos < itemSequence.length - 1; loopPos++) {
    if (itemSequence[loopPos] !== 0) {
      continue; // Skip if the current position is not empty.
    }

    let leftBoundary = loopPos; // Pointer for scanning left.
    let rightBoundary = loopPos; // Pointer for scanning right.
    let segmentCount = 0; // Current segment length.

    // Expand outwards from the current empty slot.
    while (true) {
      // Move left pointer if it's not at an 'X' boundary.
      if (itemSequence[leftBoundary] !== "X") {
        leftBoundary--;
      }
      // Move right pointer if it's not at an 'X' boundary.
      if (itemSequence[rightBoundary] !== "X") {
        rightBoundary++;
      }

      // Break condition: if both pointers hit 'X' boundaries.
      if (itemSequence[leftBoundary] === "X" && itemSequence[rightBoundary] === "X") {
        break;
      }
      // Break condition: if left pointer hits a non-empty, non-'X' element.
      if (itemSequence[leftBoundary] !== "X" && itemSequence[leftBoundary] !== 0) {
        break;
      }
      // Break condition: if right pointer hits a non-empty, non-'X' element.
      if (itemSequence[rightBoundary] !== "X" && itemSequence[rightBoundary] !== 0) {
        break;
      }

      segmentCount++; // Increment the count for the current segment.

      // Update the maximum extent if the current segment is longer.
      if (extentData[1] < segmentCount) {
        extentData = [loopPos, segmentCount];
      }
    }
  }

  // If a valid maximum empty segment was found, mark its center with 'D'.
  if (extentData[0] !== 0 && extentData[1] !== 0) {
    itemSequence[extentData[0]] = "D";
    return;
  }

  // Fallback: if no specific segment was found, just mark the first available slot (0) with 'D'.
  for (let loopPos = 1; loopPos < itemSequence.length - 1; loopPos++) {
    if (itemSequence[loopPos] === 0) {
      itemSequence[loopPos] = "D";
      return;
    }
  }
}

// Read raw data from standard input.
const fileData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the input into an array of lines and clean up whitespace.
const processedLines = fileData.trim().split("\n");

// Main processing loop; continues until termination condition.
while (true) {
  // Extract dimensions (array length and number of operations) from the first line.
  const sizeAndCommands = processedLines.shift().split(" ").map(Number);
  const arrayLength = sizeAndCommands[0];
  const commandCount = sizeAndCommands[1];

  // Termination condition: both dimensions are zero.
  if (arrayLength === 0 && commandCount === 0) {
    break;
  }

  // Initialize the working array with zeros.
  let itemSequence = [];
  for (let initIndex = 0; initIndex < arrayLength; initIndex++) {
    itemSequence.push(0);
  }

  // Add boundary markers 'X' to both ends of the array.
  itemSequence.unshift("X");
  itemSequence.push("X");

  // Process each command.
  for (let commandIndex = 0; commandIndex < commandCount; commandIndex++) {
    const currentCommand = processedLines.shift();
    if (currentCommand === "A") {
      applyAlpha();
    }
    if (currentCommand === "B") {
      applyBeta();
    }
    if (currentCommand === "C") {
      applyGamma();
    }
    if (currentCommand === "D") {
      applyDelta();
    }
  }

  // Remove the temporary boundary markers.
  itemSequence.shift();
  itemSequence.pop();

  // Output the final state of the array, replacing '0' with '#'.
  console.log(itemSequence.join("").replace(/0/g, "#"));
}