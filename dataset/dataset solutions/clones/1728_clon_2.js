"use strict";

const processInput = (rawData) => {
  const linesOfData = rawData.trim().split("\n");

  let initialSettings = linesOfData[0].split(' ').map(Number); // Parses the initial settings from the first line.
  let pileA_Durations = linesOfData[1].split(' ').map(Number);  // Reading durations for books in pile A.
  let pileB_Durations = linesOfData[2].split(' ').map(Number);  // Reading durations for books in pile B.

  let cumulativeTime = 0;     // Keeps track of the total time spent reading.
  let itemsProcessed = 0;     // Counts the number of books successfully read.

  // This recursive procedure aims to find the maximum number of books
  // that can be read given two piles of books and a time limit.
  function calculateMaxItems(firstStack, secondStack, currentAccumulatedTime, allowedTime, completedCount) {
    // --- Termination Conditions ---
    // If the accumulated time has already gone past the allowed limit.
    if (currentAccumulatedTime > allowedTime) {
      console.log(completedCount - 1);
      return;
    }
    // If the accumulated time exactly matches the allowed limit.
    else if (currentAccumulatedTime === allowedTime) {
      console.log(completedCount);
      return;
    }
    // If both stacks are empty and the time has been exceeded.
    else if (firstStack.length === 0 && secondStack.length === 0 && currentAccumulatedTime > allowedTime) {
      console.log(completedCount - 1);
      return;
    }
    // If both stacks are empty and the time is within or equal to the limit.
    else if (firstStack.length === 0 && secondStack.length === 0) {
      console.log(completedCount - 1);
      return;
    }

    // --- Book Selection Logic ---
    // Both stacks still have books.
    if (firstStack.length !== 0 && secondStack.length !== 0) {
      if (firstStack[0] >= secondStack[0]) { // Prioritize the book from the second stack if it's quicker or equal.
        currentAccumulatedTime += secondStack[0];
        secondStack.shift(); // Remove the book from the top of the second stack.
        completedCount++;
      } else if (secondStack[0] > firstStack[0]) { // Otherwise, pick the book from the first stack.
        currentAccumulatedTime += firstStack[0];
        firstStack.shift(); // Remove the book from the top of the first stack.
        completedCount++;
      }
    }
    // Only the second stack has books remaining.
    else if (firstStack.length === 0 && secondStack.length !== 0) {
      currentAccumulatedTime += secondStack[0];
      secondStack.shift();
      completedCount++;
    }
    // Only the first stack has books remaining.
    else if (secondStack.length === 0 && firstStack.length !== 0) {
      currentAccumulatedTime += firstStack[0];
      firstStack.shift();
      completedCount++;
    }

    // Continue the selection process recursively.
    calculateMaxItems(firstStack, secondStack, currentAccumulatedTime, allowedTime, completedCount);
  }

  // Initiate the book reading process with the parsed input values.
  calculateMaxItems(pileA_Durations, pileB_Durations, cumulativeTime, initialSettings[2], itemsProcessed);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));