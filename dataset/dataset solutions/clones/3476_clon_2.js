var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataProcessor;
var inputLines = [];

inputReader.on('line', function(currentLine){
  inputLines.push(currentLine);
});

inputReader.on('close', function(){
  dataProcessor = initializeInputHandler(inputLines);
  logDebugMessage("--- Program Start ---");
  var startTime = new Date();
  executeMainLogic();
  var elapsedTime = new Date() - startTime;
  logDebugMessage("--- Program End ---");
  logDebugMessage("Execution Time: " + (elapsedTime) + "ms");
});

function getNextInteger(){
  return convertInput(fetchNextLine(), 1);
}

function getNextStringArray(){
  return convertInput(fetchNextLine(), 2);
}

function getNextIntegerArray(){
  return convertInput(fetchNextLine(), 4);
}

function getNextCharacterArray(){
  return convertInput(fetchNextLine(), 6);
}

function fetchNextLine(){
  return dataProcessor.fetchNextLine();
}

function hasMoreLines(){
  return dataProcessor.hasMoreLines();
}

function initializeInputHandler(inputData){
  var handlerObject = {
    lineList : inputData,
    currentLineIndex : 0,
    totalLines : inputData.length,

    hasMoreLines : function(){
      return (this.currentLineIndex < this.totalLines);
    },

    fetchNextLine : function(){
      if(!this.hasMoreLines()){
        throw "ArrayIndexOutOfBoundsException これ以上ないよ";
      } else {
        var currentInputLine = this.lineList[this.currentLineIndex];
        this.currentLineIndex++;
        return currentInputLine;
      }
    }
  };
  return handlerObject;
}

function printResult(outputValue){
  console.log(outputValue);
}

function logDebugMessage(messageContent){
  console.error("debug:" + require("util").inspect(messageContent, false, null));
}

// This function handles various input conversions.
// Parameter `inputValue`: The input string or array to convert.
// Parameter `conversionType`: Specifies the type of conversion.
// 1: Convert to integer.
// 2: Split by space into string array.
// 4: Split by space into integer array.
// 6: Split by character into string array.
// 7: Split by character into integer array.
// 8: Join array elements with space.
// 9: Join array elements with newline.
// 0: Join array elements without separator.
// Default: Return input as is.
function convertInput(inputValue, conversionType){
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
      default: return inputValue;
    }
  } catch(e) {
    return inputValue;
  }
}

function executeMainLogic(){
  var elementCount = getNextInteger();
  var numberSequence = new Array(elementCount);
  var totalDifference = 0;
  var dequeStructure = [];

  for(var idx = 0; idx < elementCount; idx++){
    numberSequence[idx] = getNextInteger();
  }

  numberSequence.sort(function(valA, valB){
    return valA - valB;
  });

  dequeStructure.push(numberSequence.shift());

  while(numberSequence.length > 0){
    var frontElement = dequeStructure[0];
    var backElement = dequeStructure[dequeStructure.length - 1];
    var incomingFront = numberSequence[0];
    var incomingBack = numberSequence[numberSequence.length - 1];

    if(frontElement === backElement && incomingFront === incomingBack){
      dequeStructure.push(numberSequence.pop());
    } else if(frontElement === backElement){
      if(Math.abs(frontElement - incomingFront) >= Math.abs(frontElement - incomingBack)){
        dequeStructure.push(numberSequence.shift());
      } else {
        dequeStructure.push(numberSequence.pop());
      }
    } else if(incomingFront === incomingBack){
      if(Math.abs(frontElement - incomingFront) >= Math.abs(backElement - incomingFront)){
        dequeStructure.unshift(numberSequence.shift());
      } else {
        dequeStructure.push(numberSequence.shift());
      }
    } else {
      var diff1 = Math.abs(incomingFront - frontElement);
      var diff2 = Math.abs(incomingFront - backElement);
      var diff3 = Math.abs(incomingBack - frontElement);
      var diff4 = Math.abs(incomingBack - backElement);

      if(diff1 >= diff2 && diff1 >= diff3 && diff1 >= diff4){
        dequeStructure.unshift(numberSequence.pop());
        continue;
      }
      if(diff2 >= diff1 && diff2 >= diff3 && diff2 >= diff4){
        dequeStructure.push(numberSequence.shift());
        continue;
      }
      if(diff3 >= diff1 && diff3 >= diff2 && diff3 >= diff4){
        dequeStructure.unshift(numberSequence.pop());
        continue;
      }
      if(diff4 >= diff1 && diff4 >= diff2 && diff4 >= diff3){
        dequeStructure.push(numberSequence.pop());
      }
    }
  }

  for(var idx = 1; idx < elementCount; idx++){
    totalDifference += Math.abs(dequeStructure[idx - 1] - dequeStructure[idx]);
  }
  printResult(totalDifference);
}
