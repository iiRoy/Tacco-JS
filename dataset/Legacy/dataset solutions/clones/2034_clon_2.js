var inputReader = initializeInputProcessor();
ExecuteProgram();
function readInteger(){return convertInputData(getNextLine(),1);}
function readStringArray(){return convertInputData(getNextLine(),2);}
function readIntegerArray(){return convertInputData(getNextLine(),4);}
function readCharacterArray(){return convertInputData(getNextLine(),6);}
function getNextLine(){return inputReader.retrieveNextLine();}
function hasMoreLines(){return inputReader.hasMoreLines();}
function fetchInputContent(){return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");}
function initializeInputProcessor(){
  var rawInputLines = fetchInputContent();
  var processorInstance = {
    "lineBuffer" : rawInputLines,
    "currentLineIndex" : 0,
    "totalLines" : rawInputLines.length,
    "hasMoreLines" : function(){
      return (this.currentLineIndex < this.totalLines);
    },
    "retrieveNextLine" : function(){
      if(!this.hasMoreLines()){
        return "";
      } else {
        var currentLineValue = this.lineBuffer[this.currentLineIndex];
        this.currentLineIndex++;
        return currentLineValue;
      }
    }
  };
  return processorInstance;
}
function printResult(dataToOutput){console.log(dataToOutput);}
function logError(errorData){console.error(errorData);}
// This function handles various input conversions.
// It takes an input value and a conversion type.
// Type 1: Convert to integer.
// Type 2: Split by space into a string array.
// Type 4: Split by space and convert to an integer array.
// Type 6: Split into a character array.
// Type 7: Split into a character array and convert to an integer array.
// Type 8: Join array elements with a space.
// Type 9: Join array elements with a newline.
// Type 0: Join array elements without any separator.
// Default: Return input as is.
function convertInputData(inputValue, conversionType){
  try {
    switch(conversionType){
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((item)=>Number(item));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((item)=>Number(item));
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch(conversionError){
    return inputValue;
  }
}
function ExecuteProgram(){
  var firstLineValues = readIntegerArray();
  var countX = firstLineValues[0];
  var countY = firstLineValues[1];
  var valA = firstLineValues[2]; // This variable is unused in the original logic.
  var valB = firstLineValues[3]; // This variable is unused in the original logic.
  var valC = firstLineValues[4]; // This variable is unused in the original logic.
  var listA = readIntegerArray();
  var listB = readIntegerArray();
  var listC = readIntegerArray();
  listA.sort(function(elementA, elementB){
  	return elementB - elementA;
  });
  listB.sort(function(elementA, elementB){
  	return elementB - elementA;
  });
  var selectedItems = [];
  for(var idx = 0; idx < countX; idx++){
    selectedItems.push(listA[idx]);
  }
  for(var idx = 0; idx < countY; idx++){
    selectedItems.push(listB[idx]);
  }
  selectedItems = selectedItems.concat(listC);
  selectedItems.sort(function(elementA, elementB){
  	return elementB - elementA;
  });
  var totalSum = 0;
  for(var idx = 0; idx < countX + countY; idx++){
    totalSum += selectedItems[idx];
  }
  printResult(totalSum);
}
