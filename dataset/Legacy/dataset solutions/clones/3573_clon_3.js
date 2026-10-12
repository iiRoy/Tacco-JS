const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputHandlerInstance;
let rawInputLines = [];

inputReader.on('line', function(inputLine){ rawInputLines.push(inputLine); });
inputReader.on('close', function(){
  inputHandlerInstance = createInputHandler(rawInputLines);
  debugLog("-----start-----");
  const startTime = new Date();
  calculateTripletsSum();
  const endTime = new Date() - startTime;
  debugLog("----- end -----");
  debugLog("time : " + (endTime) + "ms");
  debugLog("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

class InputDataProcessor {
    constructor(inputLines) {
        this.sourceLines = inputLines;
        this.currentLineIdx = 0;
        this.totalLineCount = inputLines.length;
    }

    hasMoreData() {
        return this.currentLineIdx < this.totalLineCount;
    }

    fetchNextLine() {
        if (!this.hasMoreData()) {
            throw "ArrayIndexOutOfBoundsException これ以上ないよ";
        }
        const lineContent = this.sourceLines[this.currentLineIdx];
        this.currentLineIdx++;
        return lineContent;
    }
}

function createInputHandler(inputLines) {
  return new InputDataProcessor(inputLines);
}

function getNextInteger() { return parseInputData(inputHandlerInstance.fetchNextLine(), 1); }
function getNextStringArray() { return parseInputData(inputHandlerInstance.fetchNextLine(), 2); }
function getNextIntegerArray() { return parseInputData(inputHandlerInstance.fetchNextLine(), 4); }
function getNextCharacterArray() { return parseInputData(inputHandlerInstance.fetchNextLine(), 6); }
function getNextLineRaw() { return inputHandlerInstance.fetchNextLine(); }
function hasMoreInput() { return inputHandlerInstance.hasMoreData(); }

function outputResult(data) { console.log(data); }
function debugLog(message) { console.error("debug:" + require("util").inspect(message, false, null)); }

function parseInputData(inputVal, conversionType) {
    try {
        switch (conversionType) {
            case 1: return parseInt(inputVal);
            case 2: return inputVal.split(" ");
            case 4: return inputVal.split(" ").map(Number);
            case 6: return inputVal.split("");
            case 7: return inputVal.split("").map(Number);
            case 8: return inputVal.join(" ");
            case 9: return inputVal.join("\n");
            case 0: return inputVal.join("");
            default: return inputVal;
        }
    } catch (e) {
        return inputVal;
    }
}

function calculateTripletsSum(){
	const initialParams = getNextIntegerArray();
	const upperLimit = initialParams[0];
	const divisorValue = initialParams[1];
	let totalCombinations = 0;

	if(divisorValue === 1){
		outputResult(Math.pow(upperLimit, 3));
		return;
	}

    // Count of numbers x in [1, upperLimit] such that x % divisorValue == 0
    const countRemainderZero = Math.floor(upperLimit / divisorValue);
    
    // Add combinations where all three numbers are multiples of divisorValue (0 mod K)
    totalCombinations += Math.pow(countRemainderZero, 3);

	if(divisorValue % 2 === 0){
        const halfDivisor = divisorValue / 2;
        // Count of numbers x in [1, upperLimit] such that x % divisorValue == halfDivisor
        // These are numbers divisible by K/2 but not by K.
        const countRemainderHalfK = Math.floor(upperLimit / halfDivisor) - countRemainderZero;
        
        // Add combinations where all three numbers are (K/2 mod K)
        // The original code adds this term regardless of whether (3*K/2)%K == 0.
        totalCombinations += Math.pow(countRemainderHalfK, 3);
	}
	
	outputResult(totalCombinations);
}
