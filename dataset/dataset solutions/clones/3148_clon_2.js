var dataLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

var inputHandler = {
  "lineBuffer" : dataLines,
  "currentPosition" : 0,
  "totalLines" : dataLines.length,
  "fetchNext" : function(){
    if(!this.hasMore()){throw "NoSuchElementException:次に要素は無いよ";}
    var retrievedLine = this.lineBuffer[this.currentPosition];
    this.currentPosition++;
    return retrievedLine;
  },
  "hasMore" : function(){return (this.currentPosition < this.totalLines);}
};

ExecuteProgram();

function getNextLine(){return inputHandler.fetchNext();}
function checkMoreLines(){return inputHandler.hasMore();}
function printOutput(outputValue){console.log(outputValue);} // Standard output function
function printError(errorMessage){console.error(errorMessage);} // Standard error function

// Utility for input conversion based on 'conversionType'.
// 1: Parse as integer.
// 2: Split by space.
// 4: Split by space, then map to numbers.
// 6: Split by character.
// 7: Split by character, then map to numbers.
// 8: Join array with space.
// 9: Join array with newline.
// 0: Join array without separator.
// Default: Return input as is.
function convertInput(inputValue, conversionType){
  try{
    switch(conversionType){
      case 1: return parseInt(inputValue);
      case 2: return inputValue.split(" ");
      case 4: return inputValue.split(" ").map((item) => Number(item));
      case 6: return inputValue.split("");
      case 7: return inputValue.split("").map((item) => Number(item));
      case 8: return inputValue.join(" ");
      case 9: return inputValue.join("\n");
      case 0: return inputValue.join("");
      default: return inputValue;
    }
  } catch(exceptionDetails){
    return inputValue;
  }
}

function ExecuteProgram(){
  var parsedNumbers = convertInput(getNextLine(), 4);
  var firstNum = parsedNumbers[0];
  var secondNum = parsedNumbers[1];

  if(firstNum === secondNum){
     printOutput(firstNum);
    return;
  }

  if(firstNum % 2 === 1 && secondNum % 2 === 0){
     var midpointOffset = (secondNum - firstNum - 1) / 2;
    printOutput(firstNum ^ secondNum ^ (midpointOffset % 2));
  } else if(firstNum % 2 === 1 && secondNum % 2 === 1){
     var midpointOffset = (secondNum - firstNum) / 2;
    printOutput(firstNum ^ (midpointOffset % 2));
  } else if(firstNum % 2 === 0 && secondNum % 2 === 0){
    var midpointOffset = (secondNum - firstNum) / 2;
    printOutput(secondNum ^ (midpointOffset % 2));
  } else {
    var midpointOffset = (secondNum - firstNum + 1) / 2;
    printOutput(midpointOffset % 2);
  }
}
