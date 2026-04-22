var lineReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var sequenceFeeder; var capturedLines = [];
lineReader.on('line', function(inputLine){capturedLines.push(inputLine);});
lineReader.on('close', function(){
  sequenceFeeder = createInputSequencer(capturedLines);
  console.error('\n↑入力 ↓出力');
  performCalculationAndOperations();
});
// makeClone is not used by Main, so it's omitted from the clone to focus on relevant functionality.
// function makeClone(sourceItem){return (sourceItem instanceof Set) ? new Set(Array.from(sourceItem)) : JSON.parse(JSON.stringify(sourceItem));}
function extractInteger(){return dataTransformer(fetchNextTokenFromSource(),1);}
// function extractStringArray(){return dataTransformer(fetchNextTokenFromSource(),2);} // Not used by Main
function extractIntegerArray(){return dataTransformer(fetchNextTokenFromSource(),4);}
// function extractCharArray(){return dataTransformer(fetchNextTokenFromSource(),6);} // Not used by Main
function fetchNextTokenFromSource(){return sequenceFeeder.fetchNextToken();}
function hasMoreInputTokens(){return sequenceFeeder.hasMoreTokens();}

function createInputSequencer(sourceData){
  return {
    dataSegments : sourceData,
    currentPosition : 0,
    totalSegments : sourceData.length,
    hasMoreTokens : function(){return (this.currentPosition < this.totalSegments);},
    fetchNextToken : function(){if(this.hasMoreTokens()){return this.dataSegments[this.currentPosition++];}else{throw new Error('Input exhausted: No more data available');}}
  };
}
function outputMessage(messageContent){console.log(messageContent);}
// debugOutput is not used by Main, so it's omitted from the clone.
// function debugOutput(debugValue){console.error('debug:' + require('util').inspect(debugValue,false,null));}

// param "transformType" is
// unknown or outlier : return i. 1: parseInt.
// 2: split space. 4: split space and parseInt.
// 6: split 1 character. 7: split 1 character and parseInt.
// 8: join space. 9: join newline. 0: join no character.
function dataTransformer(itemInput, transformType){try{switch(transformType){case 1:return parseInt(itemInput);case 2:return itemInput.split(' ');case 4:return itemInput.split(' ').map(Number);case 6:return itemInput.split('');case 7:return itemInput.split('').map(Number);case 8:return itemInput.join(' ');case 9:return itemInput.join('\n');case 0:return itemInput.join('');default:return itemInput;}}catch(e){return itemInput;}}

function performCalculationAndOperations(){
  const countElements = extractInteger();
  const initialCollection = extractIntegerArray();
  initialCollection.sort((valA, valB) => valA - valB);

  const smallestElement = initialCollection[0];
  const largestElement = initialCollection[countElements - 1];

  const intermediateValues = initialCollection.slice(1, countElements - 1);
  const absoluteSumOfIntermediate = intermediateValues.reduce((accumulator, value) => accumulator + Math.abs(value), 0);
  const calculatedAggregate = largestElement - smallestElement + absoluteSumOfIntermediate;
  outputMessage(calculatedAggregate);

  const { finalLeftBoundary, finalRightBoundary, recordedOperations } = intermediateValues.reduce((state, currentVal) => {
    if (currentVal < 0) {
      state.operations.push(`${state.right} ${currentVal}`);
      state.right -= currentVal;
    } else {
      state.operations.push(`${state.left} ${currentVal}`);
      state.left -= currentVal;
    }
    return state;
  }, { left: smallestElement, right: largestElement, operations: [] });

  recordedOperations.push(`${finalRightBoundary} ${finalLeftBoundary}`);
  outputMessage(dataTransformer(recordedOperations, 9));
}