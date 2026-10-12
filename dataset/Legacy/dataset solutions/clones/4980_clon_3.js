process.stdin.resume();
process.stdin.setEncoding('ascii');

var rawInputBuffer = "";
var inputLinesArray = "";
var currentLineIdx = 0;

process.stdin.on('data', function (data) {
    rawInputBuffer += data;
});

process.on('SIGINT', function(){
    inputLinesArray = rawInputBuffer.split("\n");
    executeProcessing();
    process.exit();
});

process.stdin.on('end', function () {
    inputLinesArray = rawInputBuffer.split("\n");
    executeProcessing();    
});

function retrieveNextLine() {
    return inputLinesArray[currentLineIdx++];
}

/////////////// ignore above this line ////////////////////

function generateGridKey(rowIdentifier, colIdentifier) {
    return "r" + rowIdentifier.toString() + "_c" + colIdentifier.toString();
}

function executeProcessing() {
    const OFFSET_FOR_SQUARE_CHECK = 2;
    const MIN_VALID_COORD_VALUE = 1;
    const MAX_FREQUENCY_BUCKETS = 10; // For counts 0 through 9

    var squareHitCounts = {}; 
    
    var initialParams = retrieveNextLine().split(" ");
    var gridHeightVal = parseInt(initialParams[0], 10);
    var gridWidthVal = parseInt(initialParams[1], 10);
    var numInputPoints = parseInt(initialParams[2], 10);
    
    const effectiveGridHeight = gridHeightVal - OFFSET_FOR_SQUARE_CHECK;
    const effectiveGridWidth = gridWidthVal - OFFSET_FOR_SQUARE_CHECK;

    for (var pointIndex = 0; pointIndex < numInputPoints; pointIndex++) {
        var currentLineTokens = retrieveNextLine().split(" ");
        var pointRow = parseInt(currentLineTokens[0], 10);
        var pointCol = parseInt(currentLineTokens[1], 10);

        const startCheckRow = pointRow - OFFSET_FOR_SQUARE_CHECK;
        const endCheckRow = pointRow;
        const startCheckCol = pointCol - OFFSET_FOR_SQUARE_CHECK;
        const endCheckCol = pointCol;

        for (var checkRow = startCheckRow; checkRow <= endCheckRow; checkRow++) {
            if (checkRow < MIN_VALID_COORD_VALUE || checkRow > effectiveGridHeight) {
                continue; 
            }
            for (var checkCol = startCheckCol; checkCol <= endCheckCol; checkCol++) {
                if (checkCol < MIN_VALID_COORD_VALUE || checkCol > effectiveGridWidth) {
                    continue;
                }
                
                var gridSquareKey = generateGridKey(checkRow, checkCol);
                squareHitCounts[gridSquareKey] = (squareHitCounts[gridSquareKey] || 0) + 1;
            }
        }
    }
    
    var occurrenceFrequencies = Array.from({ length: MAX_FREQUENCY_BUCKETS }, () => 0);
    
    const totalPossibleSquares = effectiveGridHeight * effectiveGridWidth;
    
    occurrenceFrequencies[0] = totalPossibleSquares;
    
    for (var countedSquareKey in squareHitCounts) {
        occurrenceFrequencies[0]--;
        
        const hits = squareHitCounts[countedSquareKey];
        if (hits < MAX_FREQUENCY_BUCKETS) {
            occurrenceFrequencies[hits]++;
        }
    }
    
    for (var freqIdx = 0; freqIdx < MAX_FREQUENCY_BUCKETS; freqIdx++) {
        console.log(occurrenceFrequencies[freqIdx].toString());
    }
}
