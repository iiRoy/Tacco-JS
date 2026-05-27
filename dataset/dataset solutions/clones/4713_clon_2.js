process.stdin.resume();
process.stdin.setEncoding('ascii');

var inputBuffer = "";
var inputLines = "";
var currentLineIndex = 0;

process.stdin.on('data', function (chunkData) {
    inputBuffer += chunkData;
});

/*
 This section could handle process termination signals,
 but for this problem, we only care about the 'end' event.
 process.on('SIGINT', function(){
    inputLines = inputBuffer.split("\n");
    executeProgram();
    process.exit();
 });
*/

process.stdin.on('end', function () {
    inputLines = inputBuffer.split("\n");
    executeProgram();
});

function fetchLine() {
    return inputLines[currentLineIndex++];
}

// The code above this line handles input processing //

function executeProgram() {
    var currentString = fetchLine();
    currentString = currentString.split(" ");

    var mainGridDimension = parseInt(currentString[0]);
    var patternDimension = parseInt(currentString[1]);

    var mainGrid = [];
    var searchPattern = [];

    // Populate the main grid
    for (var rowIterator = 0; rowIterator < mainGridDimension; rowIterator++) {
        currentString = fetchLine().substr(0, mainGridDimension);
        mainGrid.push(currentString);
    }

    // Populate the search pattern
    for (var patternRowIterator = 0; patternRowIterator < patternDimension; patternRowIterator++) {
        currentString = fetchLine().substr(0, patternDimension);
        searchPattern.push(currentString);
    }

    var matchFoundFlag = "No";

    // Iterate through possible top-left corners in the main grid
    for (var mainGridRowOffset = 0; mainGridRowOffset < mainGridDimension - patternDimension + 1; mainGridRowOffset++) {
        for (var mainGridColOffset = 0; mainGridColOffset < mainGridDimension - patternDimension + 1; mainGridColOffset++) {
            var currentSubgridMatches = 1; // Assume match until proven otherwise

            // Check if the pattern matches at the current offset
            for (var patternCheckRow = 0; patternCheckRow < patternDimension; patternCheckRow++) {
                if (mainGrid[mainGridRowOffset + patternCheckRow].substr(mainGridColOffset, patternDimension).localeCompare(searchPattern[patternCheckRow]) !== 0) {
                    currentSubgridMatches = 0; // Mismatch found
                    break; // No need to check further rows for this offset
                }
            }

            // If all pattern rows matched for this offset
            if (currentSubgridMatches === 1) {
                process.stdout.write("Yes");
                process.exit(); // Exit immediately upon finding a match
            }
        }
    }

    // If no match was found after checking all possible offsets
    process.stdout.write("No");
    process.exit();
}
