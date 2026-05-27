var read = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputProcessor;
var inputLines = [];
read.on('line', function(input){inputLines.push(input);});
read.on('close', function(){
  inputProcessor = initializeInput(inputLines);
  console.error('\n↑入力 ↓出力');
  executePrimaryLogic();
});
function duplicateObject(source){return (source instanceof Set) ? new Set(Array.from(source)) : JSON.parse(JSON.stringify(source));}
function retrieveInteger(){return convertInput(retrieveNext(),1);}
function retrieveStringArray(){return convertInput(retrieveNext(),2);}
function retrieveIntegerArray(){return convertInput(retrieveNext(),4);}
function retrieveCharacterArray(){return convertInput(retrieveNext(),6);}
function retrieveNext(){return inputProcessor.next();}
function hasMoreInput(){return inputProcessor.hasNext();}
function initializeInput(lines){  
  return {
    dataList : lines, currentIdx : 0, maxIdx : lines.length,
    hasNext : function(){return (this.currentIdx < this.maxIdx);},
    next : function(){if(this.hasNext()){return this.dataList[this.currentIdx++];}else{throw 'InputExhaustedException: No more input available';}}
  };
}
function displayOutput(content){console.log(content);}
function displayDebug(content){console.error('debug:' + require('util').inspect(content,false,null));}
function convertInput(data, conversionType){try{switch(conversionType){case 1:return parseInt(data);case 2:return data.split(' ');case 4:return data.split(' ').map(Number);case 6:return data.split('');case 7:return data.split('').map(Number);case 8:return data.join(' ');case 9:return data.join('\n');case 0:return data.join('');default:return data;}}catch(e){return data;}}

function executePrimaryLogic(){
  const animalCount = retrieveInteger();
  const observationPattern = retrieveCharacterArray();

  const animalTypeToNum = { 'S': 0, 'W': 1 };
  const numToAnimalType = { 0: 'S', 1: 'W' };

  const deriveNextAnimal = (firstPrev, secondPrev, currentObservation) => {
    const firstNum = animalTypeToNum[firstPrev];
    const secondNum = animalTypeToNum[secondPrev];
    const xorResult = firstNum ^ secondNum;

    const nextNum = (currentObservation === 'o') ? xorResult : (1 - xorResult);
    return numToAnimalType[nextNum];
  };

  const attemptSequenceConstruction = (initialA, initialB) => {
    const currentSequence = [initialA, initialB];
    for (let k = 0; k < animalCount; k++) {
      currentSequence.push(
        deriveNextAnimal(currentSequence[k], currentSequence[k + 1], observationPattern[k])
      );
    }

    const isConsistent = (
      currentSequence[0] === currentSequence[animalCount] &&
      currentSequence[1] === currentSequence[animalCount + 1]
    );

    return isConsistent ? currentSequence.slice(0, animalCount).join('') : null;
  };

  const initialConfigurations = [
    ['S', 'S'],
    ['S', 'W'],
    ['W', 'S'],
    ['W', 'W']
  ];

  const foundSolution = initialConfigurations.reduce((accumulator, currentPair) => {
    if (accumulator !== null) {
      return accumulator;
    }
    return attemptSequenceConstruction(currentPair[0], currentPair[1]);
  }, null);

  displayOutput(foundSolution !== null ? foundSolution : -1);
}
