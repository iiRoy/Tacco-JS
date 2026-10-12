const readlineInterface = require('readline');
const debugUtil = require('util');

let inputProcessor;
const collectedInputLines = [];

const inputReader = readlineInterface.createInterface({
  input: process.stdin, output: process.stdout
});

inputReader.on('line', function(lineContent){
    collectedInputLines.push(lineContent);
});

inputReader.on('close', function(){
    inputProcessor = createInputProcessor(collectedInputLines);
    console.error("\n");
    executeMainLogic();
});

function deepCloneObject(sourceObject){
    return JSON.parse(JSON.stringify(sourceObject));
}

function parseInteger(inputString) {
    return parseInt(inputString, 10);
}
function splitStringBySpace(inputString) {
    return inputString.split(" ");
}
function parseIntegerArray(inputString) {
    return inputString.split(" ").map(Number);
}
function splitStringByChar(inputString) {
    return inputString.split("");
}
function parseCharacterIntegerArray(inputString) {
    return inputString.split("").map(Number);
}
function joinArrayWithSpace(arr) {
    return arr.join(" ");
}
function joinArrayWithNewline(arr) {
    return arr.join("\n");
}
function joinArrayWithoutSeparator(arr) {
    return arr.join("");
}

function convertInput(input, conversionType){
    try {
        switch(conversionType){
            case 1: return parseInteger(input);
            case 2: return splitStringBySpace(input);
            case 4: return parseIntegerArray(input);
            case 6: return splitStringByChar(input);
            case 7: return parseCharacterIntegerArray(input);
            case 8: return joinArrayWithSpace(input);
            case 9: return joinArrayWithNewline(input);
            case 0: return joinArrayWithoutSeparator(input);
            default: return input;
        }
    } catch(e) {
        return input;
    }
}

function createInputProcessor(lines){
    let currentLineIndex = 0;
    const totalLines = lines.length;

    return {
        inputData : lines,
        currentIndex : 0,
        maxLines : totalLines,
        hasMoreTokens : function(){
            return (this.currentIndex < this.maxLines);
        },
        getNextToken : function(){
            if(this.hasMoreTokens()){
                return this.inputData[this.currentIndex++];
            } else {
                throw new Error("ArrayIndexOutOfBoundsException: No more input available.");
            }
        }
    };
}

function readInteger(){ return convertInput(inputProcessor.getNextToken(), 1); }
function readStringArray(){ return convertInput(inputProcessor.getNextToken(), 2); }
function readIntegerArray(){ return convertInput(inputProcessor.getNextToken(), 4); }
function readCharacterArray(){ return convertInput(inputProcessor.getNextToken(), 6); }
function getNextInputToken(){ return inputProcessor.getNextToken(); }
function hasMoreInputTokens(){ return inputProcessor.hasMoreTokens(); }

function printResult(outputValue){
    console.log(outputValue);
}
function logDebug(debugMessage){
    console.error("debug:" + debugUtil.inspect(debugMessage, false, null));
}

function logPerformanceMetrics(startTime) {
    const endTime = Date.now();
    const durationMs = endTime - startTime;
    const memoryUsageKB = Math.round(process.memoryUsage().heapTotal / 1024);
    logDebug("time : " + durationMs + "ms");
    logDebug("memory : " + memoryUsageKB + "KB");
}

function executeMainLogic(){
    const startTime = Date.now();

    solveProblem();

    logPerformanceMetrics(startTime);
}

function calculateIterationState(elementValue, currentRed, currentBlue, currentGreen) {
    let iterationMatchCount = 0;
    let colorCounterIncremented = false;
    let nextRed = currentRed;
    let nextBlue = currentBlue;
    let nextGreen = currentGreen;

    if (elementValue === currentRed) {
        iterationMatchCount++;
        nextRed++;
        colorCounterIncremented = true;
    }

    if (elementValue === currentBlue) {
        iterationMatchCount++;
        if (!colorCounterIncremented) {
            nextBlue++;
            colorCounterIncremented = true;
        }
    }

    if (elementValue === currentGreen) {
        iterationMatchCount++;
        if (!colorCounterIncremented) {
            nextGreen++;
            colorCounterIncremented = true;
        }
    }
    return { iterationMatchCount, nextRed, nextBlue, nextGreen };
}

function solveProblem(){
    const arrayLength = readInteger();
    const dataSequence = readIntegerArray();

    let redCount = 1;
    let blueCount = 0;
    let greenCount = 0;
    let finalResult = 3;
    const moduloValue = 1000000007;

    const isInitialConditionMet = (dataSequence[0] === 0);
    if (!isInitialConditionMet) {
        printResult(0);
        return;
    }

    for(let currentIndex = 1; currentIndex < arrayLength; currentIndex++){
        const { iterationMatchCount, nextRed, nextBlue, nextGreen } = calculateIterationState(
            dataSequence[currentIndex],
            redCount,
            blueCount,
            greenCount
        );

        redCount = nextRed;
        blueCount = nextBlue;
        greenCount = nextGreen;

        finalResult = (finalResult * iterationMatchCount) % moduloValue;
    }
    printResult(finalResult);
}
