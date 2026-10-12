let accumulatedInput = "";
let inputLines = "";
let currentLineIndex = 0;

function fetchNextLine() {
    return inputLines[currentLineIndex++];
}

function setupInputListeners() {
    process.stdin.resume();
    process.stdin.setEncoding('ascii');

    process.stdin.on('data', function (dataChunk) {
        accumulatedInput += dataChunk;
    });

    const finalizeInputAndProcess = () => {
        inputLines = accumulatedInput.split("\n");
        processInputData();
    };

    process.on('SIGINT', function(){
        finalizeInputAndProcess();
        process.exit();
    });

    process.stdin.on('end', function () {
        finalizeInputAndProcess();
    });
}

setupInputListeners();

function processInputData() {
    const dimensionLine = fetchNextLine();
    const dimensionParts = dimensionLine.split(" ");

    const heightVal = parseInt(dimensionParts[0]);
    const widthVal = parseInt(dimensionParts[1]);

    const readGridRows = (numRows) => {
        const gridContent = [];
        for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
            const currentGridLine = fetchNextLine();
            gridContent.push(currentGridLine);
        }
        return gridContent;
    };

    const gridData = readGridRows(heightVal);

    const PRINT_REPETITIONS = 2;

    for (let rowIndex = 0; rowIndex < heightVal; rowIndex++) {
        const rowToPrint = gridData[rowIndex];
        for (let repetitionCount = 0; repetitionCount < PRINT_REPETITIONS; repetitionCount++) {
            console.log(rowToPrint);
        }
    }
}
