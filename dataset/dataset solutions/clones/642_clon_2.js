/* This program determines the minimum cost to transform a grid of characters into a flag-like pattern.
   The input consists of 'W', 'B', 'R' characters representing White, Blue, and Red.
   The goal is to divide the grid into three horizontal sections (White, Blue, Red)
   and calculate the minimum number of character changes required. */

// Define constants for character mapping and other fixed values
var WHITE_SYMBOL_CODE = 'w'; // Character code for white rows
var BLUE_SYMBOL_CODE = 'b';  // Character code for blue rows
var RED_SYMBOL_CODE = 'r';   // Character code for red rows

var INITIAL_ARRAY_INDEX = 0;
var OFFSET_BY_ONE = 1;
var MINIMUM_ROW_COUNT_FOR_DIRECT_CALC = 3; // Special case for exactly N=3 rows
var HIGH_INITIAL_COST_VALUE = 9999999; // A large number to ensure any valid cost is lower

var SPACE_CHARACTER_DELIMITER = ' ';
var LINE_FEED_SEPARATOR = '\n';


// 1. Acquire raw input string from the standard input stream
var rawInputString = require('fs').readFileSync('/dev/stdin', 'utf8');

// 2. Perform initial parsing and transformation of the input
//    - Remove any leading or trailing whitespace from the entire input.
//    - Replace 'W', 'B', 'R' characters with internal symbol codes ('w', 'b', 'r').
//    - Split the processed string into an array of individual lines.
var gridLinesProcessed = rawInputString
  .trim()
  .replace(/W/g, WHITE_SYMBOL_CODE)
  .replace(/B/g, BLUE_SYMBOL_CODE)
  .replace(/R/g, RED_SYMBOL_CODE)
  .split(LINE_FEED_SEPARATOR);

// 3. Extract the grid dimensions (number of rows and columns)
//    The first line of input contains these two numbers.
var gridDimensionsArray = gridLinesProcessed.shift().split(SPACE_CHARACTER_DELIMITER).map(Number);
var totalGridRows = gridDimensionsArray[0]; // N (number of rows)
var totalGridColumns = gridDimensionsArray[1]; // M (number of columns)

// 4. Compute the cost for each row to be entirely of a specific color.
//    For each row, this creates an object storing the cost to make that row all 'w', all 'b', or all 'r'.
//    The cost is the number of characters in that row that are *not* the target color.
var rowColorChangeCosts = gridLinesProcessed.map(function(currentGridLine) {
  var rowCostObject = {};
  rowCostObject[WHITE_SYMBOL_CODE] = totalGridColumns; // Start with cost = total columns
  rowCostObject[BLUE_SYMBOL_CODE] = totalGridColumns;
  rowCostObject[RED_SYMBOL_CODE] = totalGridColumns;

  // Iterate through characters in the current row to decrement costs
  for (var characterIndex = INITIAL_ARRAY_INDEX; characterIndex < totalGridColumns; characterIndex++) {
    rowCostObject[currentGridLine[characterIndex]]--; // Decrement cost for the character's actual color
  }
  return rowCostObject;
});

// 5. Initialize the variable to store the overall minimum cost found
var lowestTotalCost = HIGH_INITIAL_COST_VALUE;

// 6. Special handling for a grid with exactly 3 rows
//    In this specific case, the only possible pattern is WBR (White top, Blue middle, Red bottom).
if (totalGridRows === MINIMUM_ROW_COUNT_FOR_DIRECT_CALC) {
  lowestTotalCost = rowColorChangeCosts[INITIAL_ARRAY_INDEX][WHITE_SYMBOL_CODE] +
                    rowColorChangeCosts[OFFSET_BY_ONE][BLUE_SYMBOL_CODE] +
                    rowColorChangeCosts[MINIMUM_ROW_COUNT_FOR_DIRECT_CALC - OFFSET_BY_ONE][RED_SYMBOL_CODE];
}

/* 7. Iterate through all possible partition points for the three sections (White, Blue, Red).
   The original code's logic for partitioning has specific characteristics, including
   potential overlaps in row cost calculation and exclusion of the very last row
   from the red section's cost. This clone strictly adheres to that original logic.

   - `firstBlueSectionStart`: Corresponds to `i` in original. It's the index of the first row
     intended for the blue section. The white section's cost accumulates up to and including this row.
   - `firstRedSectionStart`: Corresponds to `j` in original. It's the index of the first row
     intended for the red section. The blue section's cost accumulates up to (but not including) this row.
*/

// Outer loop: Determines the starting row index for the blue section.
// The white section will be considered from row 0 up to `firstBlueSectionStart` (inclusive).
// `firstBlueSectionStart` must be at least 1, and at most `totalGridRows - 3`.
for (var firstBlueSectionStart = OFFSET_BY_ONE;
     firstBlueSectionStart < totalGridRows - (OFFSET_BY_ONE + OFFSET_BY_ONE);
     firstBlueSectionStart++) {

  // Inner loop: Determines the starting row index for the red section.
  // The blue section will be considered from `firstBlueSectionStart` up to `firstRedSectionStart - 1`.
  // `firstRedSectionStart` must be at least `firstBlueSectionStart + 1`, and at most `totalGridRows - 2`.
  for (var firstRedSectionStart = firstBlueSectionStart + OFFSET_BY_ONE;
       firstRedSectionStart < totalGridRows - OFFSET_BY_ONE;
       firstRedSectionStart++) {

    var currentIterationCost = INITIAL_ARRAY_INDEX; // Reset cost for this specific partition combination

    // Calculate cost for the "White" section: rows from 0 to `firstBlueSectionStart` (inclusive).
    // This loop directly mirrors the `while (a >= 0)` construct from the original code.
    var whiteSectionRowCounter = firstBlueSectionStart;
    while (whiteSectionRowCounter >= INITIAL_ARRAY_INDEX) {
      currentIterationCost += rowColorChangeCosts[whiteSectionRowCounter][WHITE_SYMBOL_CODE];
      whiteSectionRowCounter--;
    }

    // Calculate cost for the "Blue" section: rows from `firstBlueSectionStart` to `firstRedSectionStart - 1`.
    // This loop directly mirrors the `for (var y = i; y < j; y++)` construct from the original code.
    for (var blueSectionRowCounter = firstBlueSectionStart;
         blueSectionRowCounter < firstRedSectionStart;
         blueSectionRowCounter++) {
      currentIterationCost += rowColorChangeCosts[blueSectionRowCounter][BLUE_SYMBOL_CODE];
    }

    // Calculate cost for the "Red" section: rows from `firstRedSectionStart` to `totalGridRows - 2`.
    // This loop directly mirrors the `while (b != n - 1)` construct from the original code.
    var redSectionRowCounter = firstRedSectionStart;
    while (redSectionRowCounter !== totalGridRows - OFFSET_BY_ONE) {
      currentIterationCost += rowColorChangeCosts[redSectionRowCounter][RED_SYMBOL_CODE];
      redSectionRowCounter++;
    }

    // Update the overall minimum cost if the current partition yields a lower cost.
    lowestTotalCost = Math.min(lowestTotalCost, currentIterationCost);
  }
}

// 8. Output the final calculated minimum transformation cost to the console.
console.log(lowestTotalCost);