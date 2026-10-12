const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

/**
 * Processes the raw input string by trimming, converting specific characters
 * to numeric representations, and then splitting it into an array of lines.
 * @param {string} inputString The raw string content read from stdin.
 * @returns {string[]} An array of processed lines.
 */
function processAndSplitInput(inputString) {
    const characterMap = { 'W': '0', 'B': '1', 'R': '2' };
    const trimmedContent = inputString.trim();

    // Convert characters in the entire string before splitting into lines.
    // This ensures consistency with the original regex replacement behavior.
    const charConvertedContent = trimmedContent.split('').map(char => characterMap[char] || char).join('');
    return charConvertedContent.split('\n');
}

const processedLines = processAndSplitInput(rawInputData);

// Extract dimensions (number of rows and columns)
const dimensionsArray = processedLines.shift().split(" ").map(Number);
const totalRows = dimensionsArray[0];
const totalCols = dimensionsArray[1];

/**
 * Calculates the number of mismatches for each target color (White, Blue, Red)
 * for a given row string.
 * @param {string} rowContent The string representation of a single row (e.g., "01201").
 * @param {number} numberOfColumns The total number of columns in the grid.
 * @returns {number[]} An array [mismatchesForWhite, mismatchesForBlue, mismatchesForRed].
 */
function calculateRowMismatchCounts(rowContent, numberOfColumns) {
    // Initialize counts for '0' (White), '1' (Blue), '2' (Red) present in the row.
    const actualColorCounts = [0, 0, 0];
    for (let charIdx = 0; charIdx < numberOfColumns; charIdx++) {
        const charNumericValue = parseInt(rowContent[charIdx], 10);
        if (!isNaN(charNumericValue) && charNumericValue >= 0 && charNumericValue <= 2) {
            actualColorCounts[charNumericValue]++;
        }
    }

    // Calculate mismatches: total columns minus count of the target color.
    return [
        numberOfColumns - actualColorCounts[0], // Mismatches if this row should be all White
        numberOfColumns - actualColorCounts[1], // Mismatches if this row should be all Blue
        numberOfColumns - actualColorCounts[2]  // Mismatches if this row should be all Red
    ];
}

// Pre-calculate mismatch costs for each row
const rowMismatchCosts = processedLines.map(function(currentRowString) {
   return calculateRowMismatchCounts(currentRowString, totalCols);
});

let overallMinimumCost = 2500; // Initialize with a sufficiently large value

// Declare `currentPartitionCost` in the outer scope to mimic `var` hoisting behavior
// from the original code, where `cost` was declared inside the inner loop but
// accessed outside it, retaining its value from the last inner loop iteration.
let currentPartitionCost;

// Iterate through possible split points for the white and blue segments.
// `whiteSegmentEndRow` is the last row index of the white segment.
// `blueSegmentEndRow` is the last row index of the blue segment.
// Constraints:
// - At least one row for white (row 0).
// - At least one row for blue.
// - At least one row for red (row `totalRows - 1`).
// This implies: `whiteSegmentEndRow` must be at least 0.
// `blueSegmentEndRow` must be at least `whiteSegmentEndRow + 1`.
// `totalRows - 1` must be at least `blueSegmentEndRow + 1`.
// So, `whiteSegmentEndRow` can go from 0 up to `totalRows - 3`.
// `blueSegmentEndRow` can go from `whiteSegmentEndRow + 1` up to `totalRows - 2`.
// The original loops start `i` from 1 and `j` from `i+1`.
// `i` (whiteSegmentEndRow) from 1 to `totalRows - 3`.
// `j` (blueSegmentEndRow) from `i + 1` to `totalRows - 2`.

for (let whiteSegmentEndRow = 1; whiteSegmentEndRow <= totalRows - 3; whiteSegmentEndRow++) {
   for (let blueSegmentEndRow = whiteSegmentEndRow + 1; blueSegmentEndRow <= totalRows - 2; blueSegmentEndRow++) {
      currentPartitionCost = 0; // Reset cost for each new partition combination

      // Calculate cost for the white segment (rows 0 to whiteSegmentEndRow)
      for (let whiteRowIterator = 0; whiteRowIterator <= whiteSegmentEndRow; whiteRowIterator++) {
         currentPartitionCost += rowMismatchCosts[whiteRowIterator][0]; // Index 0 for white
      }

      // Calculate cost for the blue segment (rows whiteSegmentEndRow + 1 to blueSegmentEndRow)
      for (let blueRowIterator = whiteSegmentEndRow + 1; blueRowIterator <= blueSegmentEndRow; blueRowIterator++) {
         currentPartitionCost += rowMismatchCosts[blueRowIterator][1]; // Index 1 for blue
      }

      // Calculate cost for the red segment (rows blueSegmentEndRow + 1 to totalRows - 1)
      for (let redRowIterator = blueSegmentEndRow + 1; redRowIterator < totalRows; redRowIterator++) {
         currentPartitionCost += rowMismatchCosts[redRowIterator][2]; // Index 2 for red
      }
   }
   // This update replicates the original code's behavior where `min` was updated
   // with the `cost` value from the *last* iteration of the inner loop (`j`).
   overallMinimumCost = Math.min(overallMinimumCost, currentPartitionCost);
}

console.log(overallMinimumCost);
