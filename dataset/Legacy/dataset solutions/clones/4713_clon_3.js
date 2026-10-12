process.stdin.resume();
process.stdin.setEncoding('ascii');

let rawDataBuffer = "";
let lineDataArray = [];
let currentLineIndex = 0;

process.stdin.on('data', function (dataChunk) {
    rawDataBuffer += dataChunk;
});

process.stdin.on('end', function () {
    lineDataArray = rawDataBuffer.split("\n");
    executeLogic();    
});

function fetchNextLine() {
    return lineDataArray[currentLineIndex++];
}

// Helper function to determine if a subgrid within the main grid matches the search pattern
function checkSubgridMatch(mainGridData, searchPatternData, startRowOffset, startColOffset, patternDimension) {
    for (let patternRowIdx = 0; patternRowIdx < patternDimension; patternRowIdx++) {
        const gridSegment = mainGridData[startRowOffset + patternRowIdx].slice(startColOffset, startColOffset + patternDimension);
        const patternSegment = searchPatternData[patternRowIdx];
        
        // Using strict equality for string comparison, equivalent to localeCompare() != 0 for non-locale-sensitive exact matches
        if (gridSegment !== patternSegment) {
            return false;
        }
    }
    return true;
}

function executeLogic() {
    const initialInputLine = fetchNextLine();
    const inputDimensions = initialInputLine.split(" ");
    
    const gridSizeN = parseInt(inputDimensions[0], 10);
    const patternSizeM = parseInt(inputDimensions[1], 10);
    
    const mainGrid = []; 
    const searchPattern = [];
    
    // Populate the main grid (A)
    for (let rowIterator = 0; rowIterator < gridSizeN; rowIterator++) {
        const gridRowContent = fetchNextLine().slice(0, gridSizeN);
        mainGrid.push(gridRowContent);
    }
    
    // Populate the search pattern (B)
    for (let rowIterator = 0; rowIterator < patternSizeM; rowIterator++) {
        const patternRowContent = fetchNextLine().slice(0, patternSizeM);
        searchPattern.push(patternRowContent);
    }
    
    const maxOffset = gridSizeN - patternSizeM + 1;
    
    // Iterate through all possible top-left positions for the pattern in the main grid
    for (let rowOffset = 0; rowOffset < maxOffset; rowOffset++) {
        for (let colOffset = 0; colOffset < maxOffset; colOffset++) {
            if (checkSubgridMatch(mainGrid, searchPattern, rowOffset, colOffset, patternSizeM)) {
                process.stdout.write("Yes");
                process.exit(0); // Exit immediately upon finding a match
            }
        }        
    }
    
    // If no match is found after checking all possibilities
    process.stdout.write("No");
    process.exit(0);
}
