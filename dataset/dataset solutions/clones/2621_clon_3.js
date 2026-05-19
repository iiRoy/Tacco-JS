var inputInterface = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputProcessor;
var rawInputLines = [];

inputInterface.on('line', function(currentLine){rawInputLines.push(currentLine);});
inputInterface.on('close', function(){
  inputProcessor = initializeInputProcessor(rawInputLines);
  console.error('\n↑入力 ↓出力');
  executePrimaryLogic();
});

function deepCloneObject(sourceObject){
  const isSetInstance = sourceObject instanceof Set;
  if (isSetInstance) {
    return new Set(Array.from(sourceObject));
  } else {
    const serializedObject = JSON.stringify(sourceObject);
    return JSON.parse(serializedObject);
  }
}

function readNextInteger(){return transformInputData(fetchNextToken(), 1);}
function readNextStringArray(){return transformInputData(fetchNextToken(), 2);}
function readNextIntegerArray(){return transformInputData(fetchNextToken(), 4);}
function readNextCharacterArray(){return transformInputData(fetchNextToken(), 6);}
function fetchNextToken(){return inputProcessor.fetchNextToken();}
function hasMoreTokensAvailable(){return inputProcessor.hasMoreTokensAvailable();}

function initializeInputProcessor(inputLines){
  const inputState = {
    list : inputLines,
    currentIndex : 0,
    maximumLength : inputLines.length,
    outOfBoundsErrorMsg : 'ArrayIndexOutOfBoundsException ‚There is no more input'
  };

  inputState.hasMoreTokensAvailable = function(){
    return (this.currentIndex < this.maximumLength);
  };

  inputState.fetchNextToken = function(){
    if(this.hasMoreTokensAvailable()){
      return this.list[this.currentIndex++];
    }else{
      throw this.outOfBoundsErrorMsg;
    }
  };
  return inputState;
}

function outputResult(content){console.log(content);}
function logDebugMessage(debugContent){console.error('debug:' + require('util').inspect(debugContent,false,null));}

//param "conversionType" is
//unknown or outlier : return i. 1: parseInt.
//2: split space. 4: split space and parseInt.
//6: split 1 character. 7: split 1 character and parseInt.
//8: join space. 9: join nextline. 0: join no character.
function transformInputData(inputValue, conversionType){
  try{
    const conversionActions = {
      1: (val) => parseInt(val, 10),
      2: (val) => val.split(' '),
      4: (val) => val.split(' ').map(Number),
      6: (val) => val.split(''),
      7: (val) => val.split('').map(Number),
      8: (val) => val.join(' '),
      9: (val) => val.join('\n'),
      0: (val) => val.join('')
    };

    const action = conversionActions[conversionType];
    if (action) {
      return action(inputValue);
    } else {
      return inputValue; // Default for unknown or outlier
    }
  }catch(e){
    return inputValue; // Preserve original behavior on error
  }
}

//Don't have to see. end------------------------------------------
function executePrimaryLogic(){
  const totalCount = readNextInteger();
  const collectedResults = [];
  const outerLoopUpperLimit = totalCount - 1;

  // Helper function to find differing bit positions between two numbers
  const findDifferingBitPositions = (valueA, valueB) => {
    const differingBits = [];
    const maxBitCheck = 10; // The problem specifies checking up to 10 bits (0-9)
    for (let bitPosition = 0; bitPosition < maxBitCheck; bitPosition++) {
      const bitA = (valueA >> bitPosition) & 1;
      const bitB = (valueB >> bitPosition) & 1;
      if (bitA !== bitB) {
        differingBits.push(bitPosition + 1);
      }
    }
    return differingBits;
  };

  for(let outerIndex = 0; outerIndex < outerLoopUpperLimit; outerIndex++){
    for(let innerIndex = outerIndex + 1; innerIndex < totalCount; innerIndex++){
      const currentDifferences = findDifferingBitPositions(outerIndex, innerIndex);
      collectedResults.push(...currentDifferences); // Add all found differences to the main results array
    }
  }
  outputResult(transformInputData(collectedResults, 9));
}
