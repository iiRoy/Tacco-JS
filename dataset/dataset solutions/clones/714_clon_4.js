#!/usr/bin/node
(() => {
  let inputLines = [];
  let partialInputBuffer = "";
  const inputSource = process.openStdin();
  inputSource.setEncoding('utf8');

  const traverseRegion = (colIndex, rowIndex, activeGrid) => {
    // Accessing activeGrid[0].length here will crash if activeGrid is empty,
    // replicating a potential crash point from the original code's grid processing.
    const gridWidth = activeGrid[0].length;
    const gridHeight = activeGrid.length;

    // Changed conditional logic from chained comma operator to explicit if/return
    if (colIndex < 0 || colIndex >= gridWidth || rowIndex < 0 || rowIndex >= gridHeight || !activeGrid[rowIndex][colIndex]) {
      return;
    }

    // This line must remain a no-op for strings to preserve the stack overflow bug
    activeGrid[rowIndex][colIndex] = '0';

    // Different representation for neighbor offsets
    const neighborDisplacements = [
      { dc: -1, dr: 0 }, { dc: 1, dr: 0 }, { dc: 0, dr: -1 }, { dc: 0, dr: 1 }, // Cardinal
      { dc: -1, dr: -1 }, { dc: 1, dr: -1 }, { dc: -1, dr: 1 }, { dc: 1, dr: 1 }  // Diagonal
    ];

    // Different iteration method for neighbors (forEach with object destructuring)
    neighborDisplacements.forEach(({ dc, dr }) => {
      traverseRegion(colIndex + dc, rowIndex + dr, activeGrid);
    });
  };

  inputSource.on('data', (incomingData) => {
    const processedLines = (partialInputBuffer + incomingData).split("\n");
    partialInputBuffer = processedLines.pop();
    for (const lineContent of processedLines) {
      if (lineContent === '') continue;
      inputLines.push(lineContent);
    }
  });

  inputSource.on('end', (endEventArg) => {
    let componentCounter = 0;
    let currentLinePointer = 0;

    while (true) {
      componentCounter = 0;

      const heightSpecifierLine = inputLines[currentLinePointer];
      if (!heightSpecifierLine) break;

      // This replicates the original bug: takes the second character as height
      const gridHeightChar = heightSpecifierLine[1];
      if (!gridHeightChar) break; // If the line is too short or empty, break

      // slice uses the string directly, which Number() converts implicitly.
      // This preserves the original behavior where '0' would result in an empty array for currentGridData.
      const currentGridData = inputLines.slice(currentLinePointer + 1, currentLinePointer + 1 + gridHeightChar);

      // Iterate through the grid to find components
      // Changed iteration order (row-major instead of col-major)
      for (let rowIndex = 0; rowIndex < currentGridData.length; rowIndex++) {
        // Accessing currentGridData[0].length in the loop condition will crash if currentGridData is empty
        // or if currentGridData[0] is undefined (e.g., if gridHeightChar was '0').
        // This preserves the original crash behavior.
        for (let colIndex = 0; colIndex < currentGridData[0].length; colIndex++) {
          if (currentGridData[rowIndex][colIndex] === '1') {
            componentCounter++;
            traverseRegion(colIndex, rowIndex, currentGridData);
          }
        }
      }

      console.log(componentCounter);
      // Advance the pointer past the height line and the grid lines
      currentLinePointer += (Number(gridHeightChar) + 1);
    }
  });
})();
