var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var inputDataHandler;
var bufferedInputLines = [];

inputReader.on('line', function(currentLine){
    bufferedInputLines.push(currentLine);
});

function onInputEnd() {
  inputDataHandler = createInputProcessor(bufferedInputLines);
  console.error("\n");
  var startTime = Date.now();
  solveProblem();
  var elapsedTime = Date.now() - startTime;
  logDebugMessage("time : " + (elapsedTime) + "ms");
  logDebugMessage("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
}

inputReader.on('close', onInputEnd);

function deepCopyObject(sourceObj){
    return JSON.parse(JSON.stringify(sourceObj));
}

function readInt(){ return processInputConversion(fetchNextLine(), 1); }
function readStrArray(){ return processInputConversion(fetchNextLine(), 2); }
function readIntArray(){ return processInputConversion(fetchNextLine(), 4); }
function readCharArray(){ return processInputConversion(fetchNextLine(), 6); }

function fetchNextLine(){ return inputDataHandler.getNext(); }
function hasMoreLines(){ return inputDataHandler.hasMore(); }

function createInputProcessor(inputSourceLines){  
  var processorInstance = {
    sourceLines : inputSourceLines,
    currentLinePointer : 0,
    totalLineCount : inputSourceLines.length,
    
    hasMore : function(){
        return (this.currentLinePointer < this.totalLineCount);
    },
    getNext : function(){
        if(!this.hasMore()){
            throw "ArrayIndexOutOfBoundsException No more input lines available.";
        } else {
            var retrievedLine = this.sourceLines[this.currentLinePointer];
            this.currentLinePointer++;
            return retrievedLine;
        }
    }
  };
  return processorInstance;
}

function outputResult(outputString){ console.log(outputString); }
function logDebugMessage(debugContent){ console.error("debug:" + require("util").inspect(debugContent,false,null)); }

function processInputConversion(inputValue, conversionType){
    try {
        switch(conversionType){
            case 1: return parseInt(inputValue);
            case 2: return inputValue.split(" ");
            case 4: return inputValue.split(" ").map(Number);
            case 6: return inputValue.split("");
            case 7: return inputValue.split("").map(Number);
            case 8: return inputValue.join(" ");
            case 9: return inputValue.join("\n");
            case 0: return inputValue.join("");
            default:
                const defaultReturnValue = inputValue;
                return defaultReturnValue;
        }
    } catch(e){
        return inputValue;
    }
}

function solveProblem(){
    const DIVISOR_VALUE = 13;
    const TARGET_REMAINDER = 5;
    const BASE_FOR_MODULO = 10;
    const MODULO_CONSTANT = 1000000007;

    var targetString = fetchNextLine();
    var targetStringLength = targetString.length;
    var maxStringLengthForDP = 100005;

    var dpTable = Array.from({ length: maxStringLengthForDP }, () => new Array(DIVISOR_VALUE).fill(0));

    dpTable[0][0] = 1;

    const calculateNextRemainder = (currentRem, digit) => {
        return (currentRem * BASE_FOR_MODULO + digit) % DIVISOR_VALUE;
    };

    const updateDPTableEntry = (row, col, valueToAdd) => {
        dpTable[row][col] = (dpTable[row][col] + valueToAdd) % MODULO_CONSTANT;
    };

    for(var charIdx = 0; charIdx < targetStringLength; charIdx++){
        for(var currentRemainder = 0; currentRemainder < DIVISOR_VALUE; currentRemainder++){
            if (dpTable[charIdx][currentRemainder] === 0) {
                continue;
            }

            var charAtIndex = targetString[charIdx];

            if(charAtIndex === "?"){
                for(var digitValue = 0; digitValue < BASE_FOR_MODULO; digitValue++){
                    const nextRem = calculateNextRemainder(currentRemainder, digitValue);
                    updateDPTableEntry(charIdx + 1, nextRem, dpTable[charIdx][currentRemainder]);
                }
            } else {
                var digitValue = processInputConversion(charAtIndex, 1);
                const nextRem = calculateNextRemainder(currentRemainder, digitValue);
                updateDPTableEntry(charIdx + 1, nextRem, dpTable[charIdx][currentRemainder]);
            }
        }
    }
    outputResult(dpTable[targetStringLength][TARGET_REMAINDER]);
}
