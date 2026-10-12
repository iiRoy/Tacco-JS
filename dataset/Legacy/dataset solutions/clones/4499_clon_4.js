var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var dataStream;
var rawInputLines = [];
inputReader.on('line', function(lineContent){rawInputLines.push(lineContent);});
inputReader.on('close', function(){
  dataStream = initializeInputReader(rawInputLines);
  console.error('\n↑入力 ↓出力');
  processInputData();
});
function replicateStructure(sourceObject){return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));}
function obtainInteger(){return dataTransformer(advanceInput(),1);} function obtainStringArray(){return dataTransformer(advanceInput(),2);}
function acquireIntegerArray(){return dataTransformer(advanceInput(),4);} function obtainCharacterArray(){return dataTransformer(advanceInput(),6);}
function advanceInput(){return dataStream.next();} function hasMoreInput(){return dataStream.hasNext();}
function initializeInputReader(inputCollection){  
  return {
    lineContents : inputCollection, currentIdx : 0, maxLines : inputCollection.length,
    hasMoreInput : function(){return (this.currentIdx < this.maxLines);},
    next : function(){if(this.hasMoreInput()){return this.lineContents[this.currentIdx++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
  };
}
function emitResult(outputContent){console.log(outputContent);}
function logError(errorContent){console.error('debug:' + require('util').inspect(errorContent,false,null));}
//param "no" is
//unknown or outlier : return i. 1: parseInt.
//2: split space. 4: split space and parseInt.
//6: split 1 character. 7: split 1 character and parseInt.
//8: join space. 9: join nextline. 0: join no character.
function dataTransformer(item, transformationType){try{switch(transformationType){case 1:return parseInt(item);case 2:return item.split(' ');case 4:return item.split(' ').map(Number);case 6:return item.split('');case 7:return item.split('').map(Number);case 8:return item.join(' ');case 9:return item.join('\n');case 0:return item.join('');default:return item;}}catch(e){return item;}}

//Don't have to see. end------------------------------------------
function processInputData(){
  const countVal = obtainInteger();
  const sourceArr = acquireIntegerArray();
  
  const partitionedElements = sourceArr.reduce((accumulator, currentElement, currentIndex) => {
    if (currentIndex % 2 === 0) {
      accumulator.evens.push(currentElement);
    } else {
      accumulator.odds.push(currentElement);
    }
    return accumulator;
  }, { evens: [], odds: [] });

  let resultSequence;
  if (countVal % 2 === 0) {
    resultSequence = [...partitionedElements.odds.reverse(), ...partitionedElements.evens];
  } else {
    resultSequence = [...partitionedElements.evens.reverse(), ...partitionedElements.odds];
  }
  
  emitResult(dataTransformer(resultSequence, 8));
}
