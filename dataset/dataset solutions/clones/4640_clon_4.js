const lineReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
let collectedInputLines = [];
lineReader.on('line', (lineContent) => { collectedInputLines.push(lineContent); });
lineReader.on('close', () => {
    inputProcessorInstance = new InputHandler(collectedInputLines);
    console.error("\n");
    const startTime = new Date();
    processData();
    const endTime = new Date() - startTime;

    logDebug("time : " + (endTime) + "ms");
    logDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function deepCopyObject(source) { return JSON.parse(JSON.stringify(source)); }

class InputHandler {
    constructor(lines) {
        this.lineData = lines;
        this.currentLineIndex = 0;
    }

    hasMoreLines() {
        return this.currentLineIndex < this.lineData.length;
    }

    retrieveNextLine() {
        if (!this.hasMoreLines()) {
            throw new Error("Input exhausted.");
        }
        return this.lineData[this.currentLineIndex++];
    }
}

const transformInput = (value, typeCode) => {
    const converters = {
        1: (v) => parseInt(v, 10),
        2: (v) => v.split(" "),
        4: (v) => v.split(" ").map(Number),
        6: (v) => v.split(""),
        7: (v) => v.split("").map(Number),
        8: (v) => v.join(" "),
        9: (v) => v.join("\n"),
        0: (v) => v.join("")
    };
    try {
        return converters[typeCode] ? converters[typeCode](value) : value;
    } catch (e) {
        return value;
    }
};

let inputProcessorInstance;

const getNextValue = () => inputProcessorInstance.retrieveNextLine();
const getNextInt = () => transformInput(getNextValue(), 1);
const getNextStrArray = () => transformInput(getNextValue(), 2);
const getNextIntArray = () => transformInput(getNextValue(), 4);
const getNextCharArray = () => transformInput(getNextValue(), 6);

const displayResult = (content) => { console.log(content); };
const logDebug = (content) => { console.error("debug:" + require("util").inspect(content, false, null)); };

let elementCount;
let targetCount;
let sourceElements;
let minimumCost = 1e16;

function calculateSubsetCost(subset) {
    let currentTotal = 0;
    let tempSubset = [...subset];
    for (let k = 1; k < tempSubset.length; k++) {
        if (tempSubset[k - 1] >= tempSubset[k]) {
            const neededIncrease = tempSubset[k - 1] - tempSubset[k] + 1;
            currentTotal += neededIncrease;
            tempSubset[k] += neededIncrease;
        }
    }
    return currentTotal;
}

function generateSubsetsRecursive(currentIndex, currentSelection) {
    if (currentIndex === elementCount) {
        if (currentSelection.length >= targetCount) {
            minimumCost = Math.min(minimumCost, calculateSubsetCost(currentSelection));
        }
        return;
    }

    generateSubsetsRecursive(currentIndex + 1, currentSelection);

    generateSubsetsRecursive(currentIndex + 1, [...currentSelection, sourceElements[currentIndex]]);
}

function processData() {
    const initialParameters = getNextIntArray();
    elementCount = initialParameters[0];
    targetCount = initialParameters[1];
    sourceElements = getNextIntArray();

    if (targetCount === 1) {
        displayResult(0);
        return;
    }

    if (elementCount === 0) {
        displayResult(targetCount === 1 ? 0 : 1e16);
        return;
    }

    generateSubsetsRecursive(1, [sourceElements[0]]);

    displayResult(minimumCost);
}
