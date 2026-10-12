var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var inputDataProcessor;
var bufferedInputLines = [];

inputReader.on('line', function(inputLine){
    bufferedInputLines.push(inputLine);
});

inputReader.on('close', function(){
  inputDataProcessor = createInputProcessor(bufferedInputLines);
  console.error("\n");
  var startTime = Date.now();
  solveProblem();
  var endTime = Date.now() - startTime;
  logErrorAndDebug("time : " + (endTime) + "ms");
  logErrorAndDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function deepCloneObject(obj){
    return JSON.parse(JSON.stringify(obj));
}

function readNextInt(){ return processInputConversion(getNextLine(), 1); }
function readNextStringArray(){ return processInputConversion(getNextLine(), 2); }
function readNextIntArray(){ return processInputConversion(getNextLine(), 4); }
function readNextCharArray(){ return processInputConversion(getNextLine(), 6); }

function getNextLine(){ return inputDataProcessor.getNextLine(); }
function hasMoreLines(){ return inputDataProcessor.hasMoreLines(); }

function createInputProcessor(inputArray){
  var processorObject = {
    lineList : inputArray,
    currentIndex : 0,
    maxLines : inputArray.length,
    hasMoreLines : function(){
        return (this.currentIndex < this.maxLines);
    },
    getNextLine : function(){
        if(!this.hasMoreLines()){
            throw "ArrayIndexOutOfBoundsException これ以上ないよ";
        } else {
            var currentLine = this.lineList[this.currentIndex];
            this.currentIndex++;
            return currentLine;
        }
    }
  };
  return processorObject;
}

function displayResult(outputValue){
    console.log(outputValue);
}

function logErrorAndDebug(debugMessage){
    console.error("debug:" + require("util").inspect(debugMessage,false,null));
}

function mapToNumbers(arr) {
    return arr.map(Number);
}

function processInputConversion(inputValue, conversionType){
    try {
        switch(conversionType){
            case 1: return parseInt(inputValue);
            case 2: return inputValue.split(" ");
            case 4: return mapToNumbers(inputValue.split(" "));
            case 6: return inputValue.split("");
            case 7: return mapToNumbers(inputValue.split(""));
            case 8: return inputValue.join(" ");
            case 9: return inputValue.join("\n");
            case 0: return inputValue.join("");
            default: return inputValue;
        }
    } catch(e) {
        return inputValue;
    }
}

function buildCharPositionMap(inputString) {
    const charMap = {};
    for (let i = 0; i < inputString.length; i++) {
        const char = inputString[i];
        if (charMap[char] === undefined) {
            charMap[char] = [];
        }
        charMap[char].push(i);
    }
    return charMap;
}

function solveProblem(){
	const sourceStr = getNextLine();
	const targetStr = getNextLine();

	const charPositionMap = buildCharPositionMap(sourceStr);
    const sourceLength = sourceStr.length;

	let calculatedPosition = 0;
	let lastMatchedIndex = -1;
	let fullCycleCount = 0;

	for(let i = 0; i < targetStr.length; i++){
		const currentChar = targetStr[i];
		const charIndices = charPositionMap[currentChar];

		if (charIndices === undefined) {
			displayResult(-1);
			return;
		}

		if (i === 0){
			calculatedPosition = charIndices[0] + 1;
			lastMatchedIndex = charIndices[0];
		} else {
			const nextIndexCandidate = performBinarySearch(charIndices, lastMatchedIndex);
            let actualIndexInList = nextIndexCandidate;

			if (actualIndexInList === charIndices.length || charIndices[actualIndexInList] === lastMatchedIndex){
				fullCycleCount++;
				actualIndexInList = 0;
			}
            const currentMatchPosition = charIndices[actualIndexInList];
			calculatedPosition = (fullCycleCount * sourceLength) + currentMatchPosition + 1;
			lastMatchedIndex = currentMatchPosition;
		}
	}
	displayResult(calculatedPosition);
}

function calculateMidpoint(low, high) {
    return Math.floor((low + high) / 2);
}

function performBinarySearch(sortedIndicesList, searchValue){
  let invalidRangeEnd = -1;
  let validRangeStart = sortedIndicesList.length;
  let midIndex;

  const minDiffThreshold = 1;
  while(Math.abs(validRangeStart - invalidRangeEnd) > minDiffThreshold){
    midIndex = calculateMidpoint(validRangeStart, invalidRangeEnd);
    if(sortedIndicesList[midIndex] >= searchValue){
       validRangeStart = midIndex;
    }else{
       invalidRangeEnd = midIndex;
    }
  }
  return validRangeStart;
}
