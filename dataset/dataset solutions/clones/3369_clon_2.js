// This function processes a given input string to count specific items based on criteria.
function ProcessInputData(inputString) {
  // The raw input string is first split into an array of individual lines.
  // Each element in 'inputLines' now represents a distinct line from the original input.
  let inputLines = inputString.split('\n');

  // From the very first line of the input (index 0), we extract the target height and width.
  // The first line is expected to contain space-separated numerical values.
  let firstLineParts = inputLines[0].split(" ");
  let targetHeight = firstLineParts[1]; // The second value is designated as the target height.
  let targetWidth = firstLineParts[2];  // The third value is designated as the target width.

  // Initialize a counter to keep track of how many items meet both specified conditions.
  let matchingItemsCount = 0;

  // We then iterate through the remaining lines, starting from the second line (index 1).
  // Each of these subsequent lines is assumed to represent an item with its own dimensions.
  for (let currentLineIndex = 1; currentLineIndex < inputLines.length; currentLineIndex++) {
    // For the current item's line, split it by spaces to get its individual dimension values.
    let itemDimensionParts = inputLines[currentLineIndex].split(" ");
    let itemActualHeight = itemDimensionParts[0]; // The first value is the item's actual height.
    let itemActualWidth = itemDimensionParts[1];  // The second value is the item's actual width.

    // Evaluate if the current item's dimensions satisfy the required thresholds.
    // The condition `-1 < (value)` is mathematically equivalent to `value >= 0`.
    // Therefore, this check ensures `itemActualHeight - targetHeight >= 0`
    // and `itemActualWidth - targetWidth >= 0`, which simplifies to
    // `itemActualHeight >= targetHeight` and `itemActualWidth >= targetWidth`.
    if (-1 < (itemActualHeight - targetHeight) && -1 < (itemActualWidth - targetWidth)) {
      // If both height and width conditions are met, increment our counter.
      matchingItemsCount++;
    }
  }

  // Finally, output the total number of items that satisfied all the criteria to the console.
  console.log(matchingItemsCount);
}

// This line reads the entire content of the standard input stream synchronously.
// It uses the 'fs' (file system) module to read from '/dev/stdin' (standard input)
// and specifies 'utf8' encoding for the input string.
// The read content is then passed as an argument to the 'ProcessInputData' function.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
