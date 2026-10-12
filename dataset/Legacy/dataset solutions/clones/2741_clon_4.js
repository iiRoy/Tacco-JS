const lineProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let rawInputLines = [];
lineProcessor.on('line', (inputLine) => { rawInputLines.push(inputLine); });

let inputContext;

lineProcessor.on('close', () => {
  inputContext = createInputHandler(rawInputLines);
  console.error("\n");
  const startTime = Date.now();
  processSequence();
  const endTime = Date.now() - startTime;
  logDiagnostic("time : " + (endTime) + "ms");
  logDiagnostic("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function duplicateObject(sourceObject){return JSON.parse(JSON.stringify(sourceObject));}

class InputHandler {
  constructor(lines) {
    this.sourceLines = lines;
    this.currentLineIndex = 0;
    this.totalLines = lines.length;
  }

  hasMoreInput() {
    return (this.currentLineIndex < this.totalLines);
  }

  retrieveNextLine() {
    if (!this.hasMoreInput()) {
      throw new Error("EndOfInputException: No more lines available.");
    }
    const currentLine = this.sourceLines[this.currentLineIndex];
    this.currentLineIndex++;
    return currentLine;
  }
}

function createInputHandler(lines) {
  return new InputHandler(lines);
}

const dataConverter = new Map([
  [1, (val) => parseInt(val)],
  [2, (val) => val.split(" ")],
  [4, (val) => val.split(" ").map(Number)],
  [6, (val) => val.split("")],
  [7, (val) => val.split("").map(Number)],
  [8, (arr) => arr.join(" ")],
  [9, (arr) => arr.join("\n")],
  [0, (arr) => arr.join("")]
]);

function convertData(value, typeCode) {
  try {
    const converter = dataConverter.get(typeCode);
    return converter ? converter(value) : value;
  } catch (e) {
    return value;
  }
}

function readInteger(){return convertData(retrieveNextLine(),1);}
function readStringArray(){return convertData(retrieveNextLine(),2);}
function readIntegerArray(){return convertData(retrieveNextLine(),4);}
function readCharArray(){return convertData(retrieveNextLine(),6);}
function retrieveNextLine(){return inputContext.retrieveNextLine();}
function hasMoreInput(){return inputContext.hasMoreInput();}

function outputResult(content){console.log(content);}
function logDebug(message){console.error("debug:" + require("util").inspect(message,false,null));}

function processSequence(){
	const sequenceLength = readInteger();
	let processedElements = [];

	Array.from({ length: sequenceLength }).forEach((_, iterationCount) => {
		const currentNumber = readInteger();
		if(iterationCount === 0){
			processedElements.push(currentNumber);
		}else{
			const insertionIndex = locateInsertionPoint(processedElements, currentNumber);
			if(insertionIndex === processedElements.length){
				processedElements.push(currentNumber);
			}else{
				processedElements[insertionIndex] = currentNumber;
			}
		}
	});
	outputResult(processedElements.length);
}

function locateInsertionPoint(dataArray, targetValue){
  // This recursive function replicates the exact behavior of the original binarySearch.
  // 'currentOk' corresponds to the original 'ok' variable, representing the largest index 'i' such that dataArray[i] < targetValue.
  // 'currentNg' corresponds to the original 'ng' variable, representing the smallest index 'j' such that dataArray[j] >= targetValue.
  // The function returns 'currentOk' when the search space narrows down.
  function recursiveSearch(currentOk, currentNg) {
    if (Math.abs(currentOk - currentNg) <= 1) {
      return currentOk;
    }

    const midPoint = Math.floor((currentOk + currentNg) / 2);

    if (dataArray[midPoint] < targetValue) {
      return recursiveSearch(midPoint, currentNg);
    } else {
      return recursiveSearch(currentOk, midPoint);
    }
  }
  // Initial call with original 'ok' (dataArray.length) and 'ng' (-1) values.
  return recursiveSearch(dataArray.length, -1);
}
