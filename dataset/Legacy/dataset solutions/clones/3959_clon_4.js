let inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
let receivedLines = [];
let dataProcessor;

inputReader.on('line', (currentInputLine) => {
    receivedLines.push(currentInputLine);
});

inputReader.on('close', () => {
    dataProcessor = initializeInputHandler(receivedLines);
    logDebugMessage("-----start-----");
    const startTime = new Date();
    executePrimaryLogic();
    const endTime = new Date();
    const durationMs = endTime - startTime;
    logDebugMessage("----- end -----");
    logDebugMessage("time : " + durationMs + "ms");
    logDebugMessage("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

const transformationMap = new Map([
    [1, (val) => Number.parseInt(val)],
    [2, (val) => val.split(" ")],
    [4, (val) => val.split(" ").map(Number)],
    [6, (val) => val.split("")],
    [7, (val) => val.split("").map(Number)],
    [8, (val) => val.join(" ")],
    [9, (val) => val.join("\n")],
    [0, (val) => val.join("")]
]);

function retrieveInteger(){return transformValue(fetchNextLine(),1);}
function retrieveStringArray(){return transformValue(fetchNextLine(),2);}
function retrieveIntegerArray(){return transformValue(fetchNextLine(),4);}
function retrieveCharacterArray(){return transformValue(fetchNextLine(),6);}
function fetchNextLine(){return dataProcessor.fetchNextLine();}
function hasMoreLines(){return dataProcessor.hasMoreLines();}

function initializeInputHandler(sourceLines) {
    let currentLineIndex = 0;
    const totalLines = sourceLines.length;

    const lineIterator = {
        hasMoreLines: () => currentLineIndex < totalLines,
        fetchNextLine: () => {
            if (!lineIterator.hasMoreLines()) {
                throw "ArrayIndexOutOfBoundsException これ以上ないよ";
            }
            return sourceLines[currentLineIndex++];
        }
    };
    return lineIterator;
}

function transformValue(inputVal, transformationKey) {
    try {
        const transformer = transformationMap.get(transformationKey);
        return transformer ? transformer(inputVal) : inputVal;
    } catch (error) {
        return inputVal;
    }
}

function printOutputLine(content){console.log(content);}
function logDebugMessage(message){console.error("debug:" + require("util").inspect(message,false,null));}

function executePrimaryLogic(){
    const inputValues = retrieveIntegerArray();
    const valA = inputValues[0];
    const valB = inputValues[1];
    const gridDimension = 100;

    const dotOverrideCoords = new Set();
    for (let k = 0; k < valA - 1; k++) {
        const currentX = (k * 2) % gridDimension;
        const currentY = Math.floor(k / gridDimension) * 2;
        dotOverrideCoords.add(`${currentY},${currentX}`);
    }

    const hashOverrideCoords = new Set();
    for (let k = 0; k < valB - 1; k++) {
        const currentX = (k * 2) % gridDimension;
        const currentY = Math.floor(k / gridDimension) * 2 + 51;
        hashOverrideCoords.add(`${currentY},${currentX}`);
    }

    const generatedGrid = Array.from({ length: gridDimension }, (_, r) =>
        Array.from({ length: gridDimension }, (_, c) => {
            const coordKey = `${r},${c}`;
            if (r < 50) {
                return dotOverrideCoords.has(coordKey) ? '.' : '#';
            } else {
                return hashOverrideCoords.has(coordKey) ? '#' : '.';
            }
        }).join('')
    );

    printOutputLine(`${gridDimension} ${gridDimension}`);
    generatedGrid.forEach(rowString => printOutputLine(rowString));
}
