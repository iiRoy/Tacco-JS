function ProcessInput(rawData) {
  // Split the entire input string into an array of lines
  const parsedLines = rawData.split('\n');

  // Initialize a 3x3 grid for the bingo card
  const bingoGrid = [];
  // Populate the bingo grid from the first three lines of input
  for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
    bingoGrid[rowIdx] = parsedLines[rowIdx].split(' ');
  }

  // Get the count of numbers to be drawn
  const numPicks = parsedLines[3];
  // Initialize an array to store the drawn numbers
  const drawnNumbers = [];
  // Populate the drawn numbers array from the input, starting from the 5th line
  for (let idxA = 0; idxA < numPicks; idxA++) {
    drawnNumbers.push(parsedLines[idxA + 4]);
  }

  // Create a 3x3 grid to mark cells that match drawn numbers
  const markedCells = [];
  // Initialize all cells in the marked grid to 0 (unmarked)
  for (let idxA = 0; idxA < 3; idxA++) {
    markedCells.push([0, 0, 0]);
  }

  // Iterate through the bingo grid cells
  for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
    for (let colIdx = 0; colIdx < 3; colIdx++) {
      // Compare each cell's value with every drawn number
      for (let pickIdx = 0; pickIdx < drawnNumbers.length; pickIdx++) {
        // If a match is found, mark the corresponding cell in the markedCells grid
        if (bingoGrid[rowIdx][colIdx] === drawnNumbers[pickIdx]) {
          markedCells[rowIdx][colIdx] = 1;
        }
      }
    }
  }

  // Variable to track if a bingo line has been found
  let foundBingo = 0;

  // Check for bingo conditions (horizontal, vertical, and diagonals)
  for (let idxA = 0; idxA < 3; idxA++) {
    let horizontalMarks = 0; // Count for current row
    let verticalMarks = 0;   // Count for current column
    let diagRightMarks = 0;  // Count for main diagonal (top-left to bottom-right)
    let diagLeftMarks = 0;   // Count for anti-diagonal (top-right to bottom-left)

    for (let idxB = 0; idxB < 3; idxB++) {
      // Check horizontal line
      if (markedCells[idxA][idxB]) {
        horizontalMarks++;
      }
      // Check vertical line
      if (markedCells[idxB][idxA]) {
        verticalMarks++;
      }
    }

    // Check main diagonal (only when row and column indices are the same)
    if (markedCells[idxA][idxA]) {
      diagRightMarks++;
    }
    // Check anti-diagonal (row + column = 2 for a 3x3 grid)
    if (markedCells[idxA][3 - 1 - idxA]) { // 3-1-idxA is equivalent to 3-idxA for 0-indexed
      diagLeftMarks++;
    }

    // If any line has 3 marks, it's a bingo
    if (horizontalMarks === 3) {
      console.log('Yes');
      foundBingo++;
      break; // Exit the loop early if bingo is found
    }
    if (verticalMarks === 3) {
      console.log('Yes');
      foundBingo++;
      break; // Exit the loop early if bingo is found
    }
    // These diagonal checks are cumulative across the outer loop,
    // so they need to be checked after the loop completes or handled differently.
    // The original code's logic for diagonals is flawed if it intends to check
    // them within this loop iteration. However, to maintain Type II,
    // I must replicate the exact structure and behavior, including potential flaws.
    // The original code's diagonal checks are inside the outer loop but outside the inner loop,
    // meaning `diagRightMarks` and `diagLeftMarks` are reset on each `idxA` iteration.
    // This implies the diagonal check is only valid if `idxA` is 0, 1, or 2,
    // and the `diagRightMarks` and `diagLeftMarks` would only ever reach 1 in this structure.
    // This is a critical observation. The original code's diagonal check logic is incorrect.
    // It should accumulate marks for the *entire* diagonal, not reset per row.
    // However, Type II requires preserving the algorithm, even if flawed.
    // So, I will keep the structure as is, which means the diagonal checks will likely never trigger.
    // Let's re-evaluate the original diagonal logic.
    // Original:
    // for(var i = 0; i < 3; i++) {
    //   var checkedCountHorizontal = 0
    //   var checkedCountVertical = 0
    //   var checkedCountAngleRight = 0 // Reset here
    //   var checkedCountAngleLeft = 0  // Reset here
    //   for(var j = 0; j < 3; j++) {
    //     // ... horizontal/vertical checks ...
    //   }
    //   // Rightナナメ
    //   if(results[i][i]) checkedCountAngleRight++ // Only increments once per i
    //   // 左ナナメ
    //   if(results[i][3-i]) checkedCountAngleLeft++ // Only increments once per i
    //   // ... then checks if checkedCountAngleRight === 3 ...
    // }
    // This means the diagonal checks will *never* be true because checkedCountAngleRight/Left
    // can only ever be 0 or 1 within a single iteration of the outer loop.
    // This is a bug in the original code. I must replicate this bug for Type II.
    // So, the `diagRightMarks` and `diagLeftMarks` will indeed be reset and only increment once.
    // The conditions `diagRightMarks === 3` and `diagLeftMarks === 3` will never be met.
    // This is a strict interpretation of "preserve the algorithm".

    // Replicating the original (flawed) diagonal check logic:
    // The variables `diagRightMarks` and `diagLeftMarks` are reset at the start of each `idxA` loop.
    // They are incremented only once per `idxA` iteration if the specific diagonal cell is marked.
    // Therefore, they can never reach 3.
    // This means the following two `if` blocks will never execute.
    // This is a direct replication of the original code's behavior.
    if (diagRightMarks === 3) { // This condition will never be true due to the original algorithm's flaw
      console.log('Yes');
      foundBingo++;
      break;
    }
    if (diagLeftMarks === 3) { // This condition will never be true due to the original algorithm's flaw
      console.log('Yes');
      foundBingo++;
      break;
    }
  }

  // If no bingo was found after checking all lines, print 'No'
  if (foundBingo === 0) {
    console.log('No');
  }
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
