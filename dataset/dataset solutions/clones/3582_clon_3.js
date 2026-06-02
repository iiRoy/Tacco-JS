process.stdin.resume();
process.stdin.setEncoding('utf8');

let accumulatedInput = '';

process.stdin.on('data', (chunk) => {
    accumulatedInput += chunk;
});

process.stdin.on('end', () => {
    const rawInputLines = accumulatedInput.split(/\r?\n/);
    executeProcessing(rawInputLines);
});

const HASH_SYMBOL = '#';
const LINE_SEPARATOR = '\n';

// Helper function to check if a line string contains the hash character
const doesLineContainHash = (lineContent) => lineContent.includes(HASH_SYMBOL);

// Helper function to determine if a specific column in a character grid is entirely empty (contains no hash)
const isColumnEntirelyEmpty = (charGridData, targetColIndex) => {
    for (let rowIterator = 0; rowIterator < charGridData.length; rowIterator++) {
        if (charGridData[rowIterator][targetColIndex] === HASH_SYMBOL) {
            return false; // Found a hash, so the column is not empty
        }
    }
    return true; // No hash found in the column
};

// Helper function to remove a specific column from all rows in a character grid (modifies in-place)
const removeColumnFromAllRows = (charGridData, targetColIndex) => {
    for (let rowIterator = 0; rowIterator < charGridData.length; rowIterator++) {
        charGridData[rowIterator].splice(targetColIndex, 1);
    }
};

function processGrid(currentGridLines){
  let gridModifiedFlag = false;

  // Phase 1: Remove rows that do not contain the HASH_SYMBOL.
  // This loop modifies the `currentGridLines` array in-place.
  for(let rowIdx = 0; rowIdx < currentGridLines.length; rowIdx++){
    if(!doesLineContainHash(currentGridLines[rowIdx])){
      currentGridLines.splice(rowIdx, 1);
      rowIdx--; // Decrement index to re-evaluate the new element at the current position
      gridModifiedFlag = true;
    }
  }

  // Phase 2: Transform each line string into an array of characters.
  // This modifies the elements of `currentGridLines` in-place, turning it into a 2D array (char grid).
  for(let rowIdx = 0; rowIdx < currentGridLines.length; rowIdx++){
    currentGridLines[rowIdx] = currentGridLines[rowIdx].split("");
  }

  // Phase 3: Identify and remove columns that are entirely empty.
  // This logic preserves the original behavior where the column index is NOT decremented after removal,
  // which means if multiple consecutive columns are empty, only one will be removed per pass.
  // The outer `executeProcessing` loop handles subsequent passes.
  if (currentGridLines.length > 0) { // Ensure there are rows to process before accessing `currentGridLines[0]`
    for(let colIdx = 0; colIdx < currentGridLines[0].length; colIdx++){
      if(isColumnEntirelyEmpty(currentGridLines, colIdx)){
        removeColumnFromAllRows(currentGridLines, colIdx);
        // IMPORTANT: `colIdx` is NOT decremented here to match the original code's behavior.
        gridModifiedFlag = true;
      }
    }
  }

  // Phase 4: Convert character arrays back into strings.
  // This modifies the elements of `currentGridLines` in-place.
  for(let rowIdx = 0; rowIdx < currentGridLines.length; rowIdx++){
    currentGridLines[rowIdx] = currentGridLines[rowIdx].join("");
  }

  // Phase 5: Join all processed lines into a single string using the defined line separator.
  const finalOutputString = currentGridLines.join(LINE_SEPARATOR);

  return [gridModifiedFlag, finalOutputString];
}

function executeProcessing (initialInputArray){
  // The original code removes the first line from the input array passed to main in-place.
  initialInputArray.splice(0, 1);

  let currentProcessingResult;
  let hasModificationsOccurred;

  // The `processGrid` function modifies the `initialInputArray` (which is now `currentGridLines` inside `processGrid`) in place.
  // The loop continues as long as `processGrid` reports that modifications were made.
  do {
    currentProcessingResult = processGrid(initialInputArray); // Pass the same array reference for in-place modification
    hasModificationsOccurred = currentProcessingResult[0];
  } while(hasModificationsOccurred);

  console.log(currentProcessingResult[1]);
}
