"use strict";

const acquireInputData = (filepath) => require('fs').readFileSync(filepath, 'utf8');

const processInput = (rawText) => {
  // Normalize the input string: remove outer whitespace and divide into individual lines.
  let cleanLines = rawText.trim().split("\n");

  // Determine the overall count of numbers from the first part of the initial line.
  const totalCount = parseInt(cleanLines[0].split(" ")[0], 10);

  // Convert the second line of input into an array of integers, then sort them numerically.
  let numberList = cleanLines[1]
    .split(" ")
    .map((numStr) => parseInt(numStr, 10))
    .sort((valA, valB) => valA - valB);

  // Initialize the main iterator for traversing the sorted numerical sequence.
  let primaryPtr = 0;

  // Continue processing elements as long as the primary pointer is within the bounds of the total count.
  while (primaryPtr < totalCount) {
    // If the current number has been marked for exclusion (value -1), skip it and advance the pointer.
    if (numberList[primaryPtr] === -1) {
      primaryPtr++;
      continue;
    }

    // Initialize flags and a potential jump index for the inner loop's logic.
    let isDuplicateFound = false; // Becomes true if an identical value is encountered later.
    let nextIndexDetermined = false; // Indicates if a suitable next starting point has been identified.
    let jumpToIdx; // Stores the index to potentially jump to for the next outer loop iteration.

    // Begin a secondary iteration from the element immediately following the primary pointer.
    for (let secondaryPtr = primaryPtr + 1; secondaryPtr < totalCount; secondaryPtr++) {
      // If the secondary element is already marked for exclusion, bypass it.
      if (numberList[secondaryPtr] === -1) continue;

      // Check if the secondary element is an exact match for the primary element.
      if (numberList[secondaryPtr] === numberList[primaryPtr]) {
        isDuplicateFound = true;
      }

      // If the secondary element is perfectly divisible by the primary element, mark it for removal.
      if (numberList[secondaryPtr] % numberList[primaryPtr] === 0) {
        numberList[secondaryPtr] = -1; // Use -1 as a sentinel value for removed elements.
      }
      // Otherwise, if a next valid index hasn't been set, designate this secondary element's index as the jump point.
      else if (!nextIndexDetermined) {
        jumpToIdx = secondaryPtr;
        nextIndexDetermined = true;
      }
    }

    // After the inner loop, if a duplicate of the primary element was discovered, mark the primary element itself for removal.
    if (isDuplicateFound) numberList[primaryPtr] = -1;

    // Determine the progression of the primary pointer.
    // If a specific next index was identified during the inner loop, move the primary pointer directly to it.
    if (jumpToIdx) {
      primaryPtr = jumpToIdx;
    }
    // Otherwise, simply advance the primary pointer by one position.
    else {
      primaryPtr++;
    }
  }

  // Filter out all elements that were marked as removed (-1) and display the count of the remaining values.
  console.log(numberList.filter((numVal) => numVal !== -1).length);
};

// Initiate the processing by reading input from the standard input stream and passing it to the main function.
processInput(acquireInputData('/dev/stdin'));