const dataStreamReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
let inputProvider;
const rawInputLines = [];

dataStreamReader.on('line', function(textLine){rawInputLines.push(textLine);});
dataStreamReader.on('close', function(){
  inputProvider = initializeInput(rawInputLines);
  console.error('\n↑入力 ↓出力');
  executeValidation();
});

function replicateData(sourceObject){return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));}
function retrieveInteger(){return convertInput(retrieveNextItem(),1);}
function retrieveStringArray(){return convertInput(retrieveNextItem(),2);}
function retrieveIntegerArray(){return convertInput(retrieveNextItem(),4);}
function retrieveCharacterArray(){return convertInput(retrieveNextItem(),6);}
function retrieveNextItem(){return inputProvider.retrieveNextItem();}
function hasMoreItems(){return inputProvider.hasMoreItems();}

function initializeInput(dataLines){
  return {
    lineCollection : dataLines, currentPosition : 0, totalLines : dataLines.length,
    hasMoreItems : function(){return (this.currentPosition < this.totalLines);},
    retrieveNextItem : function(){if(this.hasMoreItems()){return this.lineCollection[this.currentPosition++];}else{throw 'EndOfInputException ‚No further input available';}}
  };
}
function outputMessage(str){console.log(str);}
function outputDebug(str){console.error('trace:' + require('util').inspect(str,false,null));}

function convertInput(item, transformationCode){
  try{
    switch(transformationCode){
      case 1:return parseInt(item);
      case 2:return item.split(' ');
      case 4:return item.split(' ').map(Number);
      case 6:return item.split('');
      case 7:return item.split('').map(Number);
      case 8:return item.join(' ');
      case 9:return item.join('\n');
      case 0:return item.join('');
      default:return item;
    }
  }catch(e){return item;}
}

function executeValidation(){
    const getIntegerParameter = () => retrieveInteger();
    const getIntegerCollection = () => retrieveIntegerArray();
    const displayResult = (indicator) => outputMessage(indicator);

    const hierarchyDepth = getIntegerParameter();
    const allNumericalValues = getIntegerCollection();

    const numericalValuesDescending = [...allNumericalValues].sort((valueA, valueB) => valueB - valueA);

    const validateHierarchyLevel = (currentTierElements, remainingValuesPool, currentLevelIndex) => {
        if (currentLevelIndex >= hierarchyDepth) {
            return true;
        }

        const nextTierSize = 1 << currentLevelIndex;
        if (remainingValuesPool.length < nextTierSize) {
             return false;
        }

        const candidateSubordinates = remainingValuesPool.slice(0, nextTierSize);
        const subsequentValuesPool = remainingValuesPool.slice(nextTierSize);

        const allComparisonsPass = currentTierElements.every((dominantValue, itemIndex) => {
            return dominantValue > candidateSubordinates[itemIndex];
        });

        if (!allComparisonsPass) {
            return false;
        }

        const combinedDominantSet = [...currentTierElements, ...candidateSubordinates];

        return validateHierarchyLevel(combinedDominantSet, subsequentValuesPool, currentLevelIndex + 1);
    };

    const topMostElement = numericalValuesDescending[0];
    const initialRemainingPool = numericalValuesDescending.slice(1);

    const finalOutcome = validateHierarchyLevel([topMostElement], initialRemainingPool, 0);
    displayResult(finalOutcome ? "Yes" : "No");
}