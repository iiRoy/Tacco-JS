var configParams = {};

var gridLayout = [];

var traceForwardPath = function(initialColumn, startingRow = 0){
    var currentColumn = initialColumn;
    var pathSequence = [currentColumn];
    const totalRows = gridLayout.length;
    for(let rowIndex = startingRow; rowIndex < totalRows; rowIndex++){
        currentColumn += gridLayout[rowIndex][currentColumn];
        pathSequence.push(currentColumn);
    }
    return pathSequence;
};

var traceBackwardPath = function(finalColumn){
    var currentColumn = finalColumn;
    var pathSequence = [currentColumn];
    const totalRows = gridLayout.length;
    for(let rowIndex = totalRows - 1; rowIndex >= 0; rowIndex--){
        currentColumn += gridLayout[rowIndex][currentColumn];
        pathSequence.push(currentColumn);
    }
    return pathSequence.reverse();
};

var rawInputLines = [];
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (dataChunk)
{
    dataChunk.trim().split('\n').forEach(function(lineStr) {
        rawInputLines.push(lineStr);
    });
});

function parseGridRow(lineString, numColumns) {
    const rowData = [];
    for (let colIndex = 0; colIndex < numColumns - 1; colIndex++) {
        let charValue = parseInt(lineString.charAt(colIndex));
        if (colIndex > 0 && charValue === 0 && rowData[colIndex - 1] === 1) {
            charValue = -1;
        }
        rowData.push(charValue);
    }
    const lastColValue = (rowData[rowData.length - 1] === 1) ? -1 : 0;
    rowData.push(lastColValue);
    return rowData;
}

process.stdin.on('end', function(){
    let finalResultOutput = "";

    const parseAllInputData = () => {
        configParams = {};
        gridLayout = [];
        const configKeys = ["lines", "start", "end", "steps"];

        for (let lineIndex = 0; lineIndex < rawInputLines.length; lineIndex++) {
            const currentLineStr = rawInputLines[lineIndex];
            if (currentLineStr === "0") {
                break;
            }

            if (lineIndex < configKeys.length) {
                const keyName = configKeys[lineIndex];
                configParams[keyName] = parseInt(currentLineStr);
            } else {
                const parsedRow = parseGridRow(currentLineStr, configParams.lines);
                gridLayout.push(parsedRow);
            }
        }
    };

    parseAllInputData();

    configParams.start -= 1;
    configParams.end -= 1;
    
    const forwardPath = traceForwardPath(configParams.start);
    const finalForwardPosition = forwardPath[forwardPath.length - 1];
    if (finalForwardPosition === configParams.end) {
        console.log("0");
        return;
    }

    const goalPath = traceBackwardPath(configParams.end);
    
    let switchPointFound = false;
    for (let rowIndex = 0; rowIndex < configParams.steps; rowIndex++) {
        const currentForwardCol = forwardPath[rowIndex];
        const currentGoalCol = goalPath[rowIndex];

        const areAdjacent = Math.abs(currentForwardCol - currentGoalCol) === 1;
        const noBarAtForward = gridLayout[rowIndex][currentForwardCol] === 0;
        const noBarAtGoal = gridLayout[rowIndex][currentGoalCol] === 0;

        if (areAdjacent && noBarAtForward && noBarAtGoal) {
            const smallerColumn = Math.min(currentForwardCol, currentGoalCol);
            finalResultOutput = (rowIndex + 1) + " " + (smallerColumn + 1);
            switchPointFound = true;
            break;
        }
    }

    if (!switchPointFound) {
        finalResultOutput = "1";
    }
    
    console.log(finalResultOutput);
});
