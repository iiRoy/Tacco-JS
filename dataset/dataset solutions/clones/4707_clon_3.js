var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputHandler;
var inputLines = [];

inputReader.on('line', function(line){inputLines.push(line);});
inputReader.on('close', function(){
  inputHandler = createInputProcessor(inputLines);
  console.error('\n↑入力 ↓出力');
  solveProblem();
});

function createDeepCopy(sourceObj){return (sourceObj instanceof Set) ? new Set(Array.from(sourceObj)) : JSON.parse(JSON.stringify(sourceObj));}

function readInteger(){return convertInput(getNextToken(), 1);}
function readStringArray(){return convertInput(getNextToken(), 2);}
function readIntArray(){return convertInput(getNextToken(), 4);}
function readCharacterArray(){return convertInput(getNextToken(), 6);}

function getNextToken(){return inputHandler.getNextToken();}
function hasMoreTokens(){return inputHandler.hasMoreTokens();}

function createInputProcessor(linesArray){  
  let currentLineIndex = 0;
  const maxLineIndex = linesArray.length;

  return {
    hasMoreTokens : function(){return (currentLineIndex < maxLineIndex);},
    getNextToken : function(){
      if(this.hasMoreTokens()){
        return linesArray[currentLineIndex++];
      }else{
        throw 'ArrayIndexOutOfBoundsException – No more input available';
      }
    }
  };
}

function printResult(outputValue){console.log(outputValue);}
function printDebug(debugValue){console.error('debug:' + require('util').inspect(debugValue,false,null));}

const conversionFunctions = {
  1: parseInt,
  2: (val) => val.split(' '),
  4: (val) => val.split(' ').map(Number),
  6: (val) => val.split(''),
  7: (val) => val.split('').map(Number),
  8: (val) => val.join(' '),
  9: (val) => val.join('\n'),
  0: (val) => val.join('')
};

function convertInput(inputValue, conversionType){
  try{
    const converter = conversionFunctions[conversionType];
    if (converter) {
      return converter(inputValue);
    }
    return inputValue; // Default case if conversionType is not found
  }catch(e){
    return inputValue;
  }
}

function determineNextAnimal(observerType, prevAnimal1, prevAnimal2) {
  const arePreviousAnimalsSame = (prevAnimal1 === prevAnimal2);
  if (observerType === "o") { // Observant sheep
    return arePreviousAnimalsSame ? "S" : "W";
  } else { // Observant wolf
    return arePreviousAnimalsSame ? "W" : "S";
  }
}

function solveProblem(){
  var animalCount = readInteger();
  var sheepWolfSequence = readCharacterArray();
  var initialStates = [["S", "S"], ["S", "W"], ["W", "S"], ["W", "W"]];

  for(var stateIdx = 0; stateIdx < initialStates.length; stateIdx++){
    const sequenceLength = animalCount + 2;
    var currentSequence = new Array(sequenceLength);
    
    currentSequence[0] = initialStates[stateIdx][0];
    currentSequence[1] = initialStates[stateIdx][1];
    
    for(var currentIdx = 0; currentIdx < animalCount; currentIdx++){
      const observer = sheepWolfSequence[currentIdx];
      const firstNeighbor = currentSequence[currentIdx];
      const secondNeighbor = currentSequence[currentIdx + 1];
      
      currentSequence[currentIdx + 2] = determineNextAnimal(observer, firstNeighbor, secondNeighbor);
    }
    
    const firstAnimalMatches = (currentSequence[0] === currentSequence[animalCount]);
    const secondAnimalMatches = (currentSequence[1] === currentSequence[animalCount + 1]);

    if(firstAnimalMatches && secondAnimalMatches){
      const finalResult = currentSequence.slice(0, animalCount).join("");
      printResult(finalResult);
      return;
    }
  }
  printResult(-1);
}
