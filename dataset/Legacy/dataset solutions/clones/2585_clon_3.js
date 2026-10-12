var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var dataHandler; var inputLines = [];
inputReader.on('line', function(lineContent){inputLines.push(lineContent);});
inputReader.on('close', function(){
  dataHandler = initializeInputHandler(inputLines);
  console.error('\n↑入力 ↓出力');
  executeMainLogic();
});
function createDeepCopy(sourceObj){return (sourceObj instanceof Set) ? new Set(Array.from(sourceObj)) : JSON.parse(JSON.stringify(sourceObj));}
function readInteger(){return convertInput(getNextToken(),1);} function readStringArray(){return convertInput(getNextToken(),2);}
function readIntegerArray(){return convertInput(getNextToken(),4);} function readCharacterArray(){return convertInput(getNextToken(),6);}
function getNextToken(){return dataHandler.getNextToken();} function hasMoreTokens(){return dataHandler.hasMoreTokens();}
function initializeInputHandler(lines){
  return {
    lineList : lines, currentIdx : 0, maxLines : lines.length,
    hasMoreTokens : function(){return (this.currentIdx < this.maxLines);},
    getNextToken : function(){if(this.hasMoreTokens()){return this.lineList[this.currentIdx++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
  };
}
function printOutput(outputStr){console.log(outputStr);}
function printDebugError(debugInfo){console.error('debug:' + require('util').inspect(debugInfo,false,null));}
//param "conversionType" is
//unknown or outlier : return i. 1: parseInt.
//2: split space. 4: split space and parseInt.
//6: split 1 character. 7: split 1 character and parseInt.
//8: join space. 9: join nextline. 0: join no character.
function convertInput(inputValue, conversionType){
  try{
    switch(conversionType){
      case 1: return parseInt(inputValue);
      case 2: return inputValue.split(' ');
      case 4: return inputValue.split(' ').map(Number);
      case 6: return inputValue.split('');
      case 7: return inputValue.split('').map(Number);
      case 8: return inputValue.join(' ');
      case 9: return inputValue.join('\n');
      case 0: return inputValue.join('');
      default: return inputValue;
    }
  }catch(e){
    return inputValue;
  }
}

function executeMainLogic(){
  var elementCount = readInteger();
  var inputValues = readIntegerArray();
  inputValues.sort(function(a, b){
    return a - b;
  });

  var previousLevelValues = [];
  // The largest element is the root of the "pyramid"
  previousLevelValues.push(inputValues.pop());

  // Iterate through levels of the pyramid structure
  for(var levelIndex = 1; levelIndex <= elementCount; levelIndex++){
    var currentLevelValues = [];
    var elementsToPop = 1 << levelIndex; // Calculate number of elements for the current level

    // Populate currentLevelValues by popping from the sorted inputValues
    for(var valueIndex = 0; valueIndex < elementsToPop; valueIndex++){
      currentLevelValues.push(inputValues.pop());
    }

    // Compare elements of the current level with the previous level
    var comparisonFailed = false;
    for(var valueIndex = 0; valueIndex < currentLevelValues.length; valueIndex++){
      // Check if the element from the previous level is NOT strictly greater than the current level's element
      if(previousLevelValues[valueIndex] <= currentLevelValues[valueIndex]){
        comparisonFailed = true;
        break; // Exit inner loop early if condition is met
      }
    }

    if(comparisonFailed){
      printOutput("NO");
      return; // Exit function early if any comparison fails
    }

    // If all comparisons pass, update previousLevelValues for the next iteration
    previousLevelValues = previousLevelValues.concat(currentLevelValues);
  }

  // If all levels pass the comparison, output YES
  printOutput("YES");
}
