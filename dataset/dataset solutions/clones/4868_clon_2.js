let initialInput;
let gridHeight;
let gridWidth;

// The entire incoming dataset is contained within the 'initialInput' variable.
function AnalyzeGrid(inputContent) {
  // The first line resides in inputContent[0], the second in inputContent[1], and so forth.
  inputContent = inputContent.split('\n');

  gridHeight = parseInt(inputContent[0].split(' ')[0], 10);
  gridWidth = parseInt(inputContent[0].split(' ')[1], 10);

  let priorScan;
  let currentScan = inputContent[1];

  // Iterate through the grid vertically (row by row).
  for (let rowIndex = 2; rowIndex <= gridHeight; rowIndex++) {
    let hashSymbolCount = 0;
    priorScan = currentScan;
    currentScan = '';

    // Iterate across the grid horizontally (column by column).
    for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
      if (inputContent[rowIndex][colIndex] === '#') {
        if (rowIndex === gridHeight && colIndex === gridWidth - 1) {
          console.log('Feasible');
          return;
        } else if (colIndex + 1 <= gridWidth && rowIndex + 1 <= gridHeight && inputContent[rowIndex][colIndex + 1] === '#' && inputContent[rowIndex + 1][colIndex] === '#') {
          console.log('Unattainable');
          return;
        } else if (priorScan[colIndex] !== '#') {
          if (colIndex === 0 || (colIndex > 0 && inputContent[rowIndex][colIndex - 1] !== '#')) {
            currentScan += '.';
            continue;
          }
        }
        currentScan += '#';
        hashSymbolCount++;
      } else {
        currentScan += '.';
      }
    }
    if (hashSymbolCount === 0) {
      break;
    }
  }
  console.log('Unattainable');
}

// * Do not modify the code below this line (reads from standard input/output and invokes the primary processing function).
AnalyzeGrid(require('fs').readFileSync('/dev/stdin', 'utf8'));