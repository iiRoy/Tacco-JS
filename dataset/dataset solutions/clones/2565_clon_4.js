var lineReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputSource; var rawInputLines = [];
lineReader.on('line', function(inputLine){rawInputLines.push(inputLine);});
lineReader.on('close', function(){
  inputSource = initializeInputProcessor(rawInputLines);
  console.error("\n");
  var startTime = Date.now();
  processInputSequence();
  var endTime = Date.now() - startTime;
  reportDebugInfo("time : " + endTime + "ms");
  reportDebugInfo("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function replicateObject(objToCopy){return JSON.parse(JSON.stringify(objToCopy));}
function obtainInteger(){return transformInput(retrieveNext(),1);}
function obtainStringArray(){return transformInput(retrieveNext(),2);}
function obtainIntegerArray(){return transformInput(retrieveNext(),4);}
function obtainCharacterArray(){return transformInput(retrieveNext(),6);}
function retrieveNext(){return inputSource.getNext();}
function canRetrieveMore(){return inputSource.hasMore();}

class InputIterator {
    constructor(lines) {
        this.dataLines = lines;
        this.currentLineIndex = 0;
        this.totalLines = lines.length;
    }

    hasMore() {
        return (this.currentLineIndex < this.totalLines);
    }

    getNext() {
        if (this.hasMore()) {
            return this.dataLines[this.currentLineIndex++];
        } else {
            throw "ArrayIndexOutOfBoundsException ‚There is no more input";
        }
    }
}
function initializeInputProcessor(inputData){  
  return new InputIterator(inputData);
}
function emitOutput(content){console.log(content);}
function reportDebugInfo(message){console.error("debug:" + require("util").inspect(message,false,null));}

const conversionHandlers = {
    1: (val) => parseInt(val),
    2: (val) => val.split(" "),
    4: (val) => val.split(" ").map(Number),
    6: (val) => val.split(""),
    7: (val) => val.split("").map(Number),
    8: (val) => val.join(" "),
    9: (val) => val.join("\n"),
    0: (val) => val.join("")
};

function transformInput(valueToConvert, conversionType) {
    try {
        const handler = conversionHandlers[conversionType];
        if (handler) {
            return handler(valueToConvert);
        }
        return valueToConvert;
    } catch (e) {
        return valueToConvert;
    }
}

function processInputSequence(){
  const initialCount = obtainInteger();
  let charSequence = obtainCharacterArray();
  let maxMatchLength = 0;
  
  while(charSequence.length > 0){
    const currentStringLength = charSequence.length;
    const zArray = computeZValues(charSequence);
    
    for(let scanIdx = currentStringLength - 1; scanIdx >= 1; --scanIdx){
      if(zArray[scanIdx] <= currentStringLength / 2){
        maxMatchLength = Math.max(maxMatchLength, zArray[scanIdx]);
      }
    }
    charSequence.shift();
  }
  
  emitOutput(maxMatchLength);
}

function computeZValues(inputChars) {
    const sequenceLength = inputChars.length;
    const zValues = new Array(sequenceLength).fill(0);
    zValues[0] = sequenceLength;

    let leftBoundary = 0;
    let rightBoundary = 0; // rightBoundary is exclusive, points to one past the end of the Z-box

    for (let currentPosition = 1; currentPosition < sequenceLength; ++currentPosition) {
        if (currentPosition > rightBoundary) {
            // Case 1: currentPosition is outside the current Z-box
            leftBoundary = currentPosition;
            rightBoundary = currentPosition;
            while (rightBoundary < sequenceLength && inputChars[rightBoundary - leftBoundary] === inputChars[rightBoundary]) {
                rightBoundary++;
            }
            zValues[currentPosition] = rightBoundary - leftBoundary;
        } else {
            // Case 2: currentPosition is inside the current Z-box
            const kOffset = currentPosition - leftBoundary;
            if (zValues[kOffset] < rightBoundary - currentPosition) {
                zValues[currentPosition] = zValues[kOffset];
            } else {
                leftBoundary = currentPosition;
                while (rightBoundary < sequenceLength && inputChars[rightBoundary - leftBoundary] === inputChars[rightBoundary]) {
                    rightBoundary++;
                }
                zValues[currentPosition] = rightBoundary - leftBoundary;
            }
        }
    }
    return zValues;
}
