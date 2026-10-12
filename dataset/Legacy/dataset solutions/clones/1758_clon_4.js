var ioHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var dataStream;
var inputBuffer = [];
ioHandler.on('line', function(lineContent){inputBuffer.push(lineContent);});
ioHandler.on('close', function(){
  dataStream = new InputProcessor(inputBuffer);
  logDebug("-----start-----");
  var initialTime = new Date();
  executeSolution();
  var finalTime = new Date() - initialTime;
  logDebug("----- end -----");
  logDebug("time : " + (finalTime) + "ms");
  logDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function fetchInteger(){return transformValue(fetchLine(),1);}
function fetchStringArray(){return transformValue(fetchLine(),2);}
function fetchIntegerArray(){return transformValue(fetchLine(),4);}
function fetchCharacterArray(){return transformValue(fetchLine(),6);}
function fetchLine(){return dataStream.retrieveNext();}
function checkMoreInput(){return dataStream.hasMore();}

class InputProcessor {
    constructor(lines) {
        this.sourceLines = lines;
        this.currentIdx = 0;
        this.maxLines = lines.length;
    }

    hasMore() {
        return this.currentIdx < this.maxLines;
    }

    retrieveNext() {
        if (!this.hasMore()) {
            throw "ArrayIndexOutOfBoundsException これ以上ないよ";
        }
        const currentLine = this.sourceLines[this.currentIdx];
        this.currentIdx++;
        return currentLine;
    }
}

function printResult(outputContent){console.log(outputContent);}
function logDebug(debugMessage){console.error("debug:" + require("util").inspect(debugMessage,false,null));}

const conversionActions = {
    1: (val) => parseInt(val),
    2: (val) => val.split(" "),
    4: (val) => val.split(" ").map(Number),
    6: (val) => val.split(""),
    7: (val) => val.split("").map(Number),
    8: (val) => val.join(" "),
    9: (val) => val.join("\n"),
    0: (val) => val.join(""),
};

function transformValue(inputValue, conversionType) {
    try {
        const action = conversionActions[conversionType];
        return action ? action(inputValue) : inputValue;
    } catch (e) {
        return inputValue;
    }
}

function computeDivisor(firstVal, secondVal) {
    while (secondVal !== 0) {
        let temporary = secondVal;
        secondVal = firstVal % secondVal;
        firstVal = temporary;
    }
    return firstVal;
}

function executeSolution(){
	var inputNumber = fetchInteger();
	var finalCount = 360 / computeDivisor(inputNumber, 360);
	printResult(finalCount);
}
