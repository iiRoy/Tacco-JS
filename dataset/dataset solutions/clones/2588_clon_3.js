var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputDataProcessor; var rawInputLines = [];
inputReader.on('line', function(inputLine){rawInputLines.push(inputLine);});
inputReader.on('close', function(){
  inputDataProcessor = initializeDataProcessor(rawInputLines);
  console.error('\n↑入力 ↓出力');
  processMainAlgorithm();
});

function deepCopyObject(originalObj){
  return (originalObj instanceof Set) ? new Set(Array.from(originalObj)) : JSON.parse(JSON.stringify(originalObj));
}

function readNextInteger(){return performTypeConversion(fetchNextItem(),1);}
function readNextStringArray(){return performTypeConversion(fetchNextItem(),2);}
function readNextIntegerArray(){return performTypeConversion(fetchNextItem(),4);}
function readNextCharacterArray(){return performTypeConversion(fetchNextItem(),6);}

function fetchNextItem(){return inputDataProcessor.fetchNextItem();}
function hasMoreItems(){return inputDataProcessor.hasMoreItems();}

function initializeDataProcessor(inputArray){  
  return {
    list : inputArray, index : 0, max : inputArray.length,
    hasMoreItems : function(){return (this.index < this.max);},
    fetchNextItem : function(){
      if(this.hasMoreItems()){
        return this.list[this.index++];
      }else{
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

function outputResult(message){console.log(message);}
function outputDebugMessage(message){console.error('debug:' + require('util').inspect(message,false,null));}

function performTypeConversion(inputValue, conversionType){
  try{
    switch(conversionType){
      case 1:return parseInt(inputValue);
      case 2:return inputValue.split(' ');
      case 4:return inputValue.split(' ').map(Number);
      case 6:return inputValue.split('');
      case 7:return inputValue.split('').map(Number);
      case 8:return inputValue.join(' ');
      case 9:return inputValue.join('\n');
      case 0:return inputValue.join('');
      default:return inputValue;
    }
  }catch(e){
    return inputValue;
  }
}

const compareAscending = (valueA, valueB) => valueA - valueB;
const compareDescending = (valueA, valueB) => valueB - valueA;

function checkSublistCondition(listOne, listTwo) {
  const comparisonLimit = listTwo.length;
  for (let elementIndex = 0; elementIndex < comparisonLimit; elementIndex++) {
    if (listOne[elementIndex] <= listTwo[elementIndex]) {
      return false;
    }
  }
  return true;
}

function processMainAlgorithm(){
  const totalCount = readNextInteger();
  let numericData = readNextIntegerArray();

  numericData.sort(compareAscending);

  let currentComparisonSet = [];
  const initialElement = numericData.pop();
  currentComparisonSet.push(initialElement);

  for(let iterationIndex = 0; iterationIndex < totalCount; iterationIndex++){
    const subsetSize = 1 << iterationIndex;
    let subsetForComparison = [];

    for(let elementIndex = 0; elementIndex < subsetSize; elementIndex++){
      subsetForComparison.push(numericData.pop());
    }

    subsetForComparison.sort(compareDescending);
    currentComparisonSet.sort(compareDescending);
    
    //outputDebugMessage(currentComparisonSet);
    //outputDebugMessage(subsetForComparison);

    if (!checkSublistCondition(currentComparisonSet, subsetForComparison)) {
      outputResult("No");
      return;
    }
    
    currentComparisonSet = currentComparisonSet.concat(subsetForComparison);
  }
  outputDebugMessage(currentComparisonSet);
  outputResult("Yes");
}
