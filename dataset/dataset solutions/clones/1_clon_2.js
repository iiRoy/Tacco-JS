let outerCounter, innerCounter; // Initialize two numerical counters for iteration.

// Start the primary loop, iterating from the value one up to and including nine.
for (outerCounter = 1; outerCounter <= 9; outerCounter++) {
  // Within each cycle of the primary loop, initiate a secondary, nested loop.
  for (innerCounter = 1; innerCounter <= 9; innerCounter++) {
    // Display the current multiplication operation and its calculated product.
    console.log(outerCounter + "x" + innerCounter + "=" + innerCounter * outerCounter);
  }
}
