var setupInputHandling = function(onCloseCallback) {
  var reader = require('readline').createInterface({
    input: process.stdin, output: process.stdout
  });
  var linesBuffer = [];
  reader.on('line', function(line) { linesBuffer.push(line); });
  reader.on('close', function() { onCloseCallback(linesBuffer); });
};

var InputProcessor = function(inputDataLines) {
  this.dataLines = inputDataLines;
  this.currentIdx = 0;
  this.maxIdx = inputDataLines.length;

  this.hasMore = function() {
    return this.currentIdx < this.maxIdx;
  };

  this.retrieveNext = function() {
    if (this.hasMore()) {
      return this.dataLines[this.currentIdx++];
    } else {
      throw "ArrayIndexOutOfBoundsException ‚There is no more input";
    }
  };
};

var createDeepClone = function(sourceObject){
  return JSON.parse(JSON.stringify(sourceObject));
};

var parseInteger = function(value) {
  return parseInt(value, 10);
};

var splitStringBySpace = function(value) {
  return value.split(" ");
};

var splitStringByChar = function(value) {
  return value.split("");
};

var mapToNumbers = function(arr) {
  return arr.map(Number);
};

var joinArrayBySpace = function(arr) {
  return arr.join(" ");
};

var joinArrayByNewline = function(arr) {
  return arr.join("\n");
};

var joinArrayWithoutSeparator = function(arr) {
  return arr.join("");
};

var convertInput = function(inputValue, conversionType){
  try{
    switch(conversionType){
      case 1: return parseInteger(inputValue);
      case 2: return splitStringBySpace(inputValue);
      case 4: return mapToNumbers(splitStringBySpace(inputValue));
      case 6: return splitStringByChar(inputValue);
      case 7: return mapToNumbers(splitStringByChar(inputValue));
      case 8: return joinArrayBySpace(inputValue);
      case 9: return joinArrayByNewline(inputValue);
      case 0: return joinArrayWithoutSeparator(inputValue);
      default: return inputValue;
    }
  }catch(e){
    return inputValue;
  }
};

var globalInputHandler;

setupInputHandling(function(receivedLines) {
  globalInputHandler = new InputProcessor(receivedLines);
  console.error("\n");
  var executionStartTime = Date.now();
  executeMainProgramLogic();
  var executionDuration = Date.now() - executionStartTime;
  logDebugMessage("time : " + executionDuration + "ms");
  logDebugMessage("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

var getNextValue = function(){return globalInputHandler.retrieveNext();};
var hasMoreInput = function(){return globalInputHandler.hasMore();};

var getNextInteger = function(){return convertInput(getNextValue(),1);};
var getNextStringArray = function(){return convertInput(getNextValue(),2);};
var getNextIntegerArray = function(){return convertInput(getNextValue(),4);};
var getNextCharacterArray = function(){return convertInput(getNextValue(),6);};

var printOutput = function(data){console.log(data);};
var logDebugMessage = function(message){console.error("debug:" + require("util").inspect(message,false,null));};

var computeOriginalZAlgorithm = function(sequence) {
  var currentSeqLength = sequence.length;
  var zResultArray = new Array(currentSeqLength);
  if (currentSeqLength === 0) {
    return zResultArray;
  }

  zResultArray[0] = currentSeqLength;
  var primaryIndex = 1;
  var matchLength = 0;

  while (primaryIndex < currentSeqLength) {
    while ((primaryIndex + matchLength) < currentSeqLength && (sequence[matchLength] === sequence[primaryIndex + matchLength])) {
      matchLength++;
    }
    zResultArray[primaryIndex] = matchLength;

    if (matchLength === 0) {
      primaryIndex++;
      continue;
    }

    var secondaryIndex = 1;
    while ((primaryIndex + secondaryIndex) < currentSeqLength && (secondaryIndex + zResultArray[secondaryIndex] < matchLength)) {
      zResultArray[primaryIndex + secondaryIndex] = zResultArray[secondaryIndex];
      secondaryIndex++;
    }
    primaryIndex += secondaryIndex;
    matchLength -= secondaryIndex;
  }
  return zResultArray;
};

var findMaxZValueInSuffix = function(zValues, sequenceLength) {
  var currentMax = 0;
  var suffixStartThreshold = Math.floor(sequenceLength / 2);
  for (var idx = sequenceLength - 1; idx >= suffixStartThreshold; idx--) {
    currentMax = Math.max(currentMax, zValues[idx]);
  }
  return currentMax;
};

var executeMainProgramLogic = function(){
  var sequenceCount = getNextInteger();
  var characterSequence = getNextCharacterArray();

  var overallMaxOverlap = 0;

  if (characterSequence.length === 0) {
    printOutput(0);
    return;
  }

  while(characterSequence.length > 0){
    var currentSequenceLength = characterSequence.length;

    var zCalculatedArray = computeOriginalZAlgorithm(characterSequence);

    overallMaxOverlap = Math.max(overallMaxOverlap, findMaxZValueInSuffix(zCalculatedArray, currentSequenceLength));

    characterSequence.shift();
  }

  printOutput(overallMaxOverlap);
};
