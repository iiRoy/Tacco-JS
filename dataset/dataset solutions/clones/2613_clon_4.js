//Don't have to see. start------------------------------------------
var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputHandler; var receivedLines = [];
inputReader.on('line', function(currentLine){receivedLines.push(currentLine);});
inputReader.on('close', function(){
  inputHandler = initializeInputProcessor(receivedLines);
  console.error('\n↑入力 ↓出力');
  processInputData();
});
function deepCopyStructure(sourceObject){return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));}
function retrieveInteger(){return transformInput(getNextItem(),1);} function retrieveStringArray(){return transformInput(getNextItem(),2);}
function retrieveIntegerArray(){return transformInput(getNextItem(),4);} function retrieveCharacterArray(){return transformInput(getNextItem(),6);}
function getNextItem(){return inputHandler.fetchNext();} function hasMoreItems(){return inputHandler.checkAvailability();}
function initializeInputProcessor(inputData){
  return {
    sourceLines : inputData, currentPosition : 0, totalLines : inputData.length,
    checkAvailability : function(){return (this.currentPosition < this.totalLines);},
    fetchNext : function(){if(this.checkAvailability()){return this.sourceLines[this.currentPosition++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
  };
}
function displayResult(outputValue){console.log(outputValue);}
function logDebugInfo(debugContent){console.error('debug:' + require('util').inspect(debugContent,false,null));}
//param "conversionType" is
//unknown or outlier : return inputValue. 1: parseInt.
//2: split space. 4: split space and parseInt.
//6: split 1 character. 7: split 1 character and parseInt.
//8: join space. 9: join nextline. 0: join no character.
function transformInput(inputValue,conversionType){try{switch(conversionType){case 1:return parseInt(inputValue);case 2:return inputValue.split(' ');case 4:return inputValue.split(' ').map(Number);case 6:return inputValue.split('');case 7:return inputValue.split('').map(Number);case 8:return inputValue.join(' ');case 9:return inputValue.join('\n');case 0:return inputValue.join('');default:return inputValue;}}catch(e){return inputValue;}}

//Don't have to see. end------------------------------------------
function processInputData(){
  var initialParams = retrieveIntegerArray();
  var maxMonth = initialParams[0];
  var maxDay = initialParams[1];

  const validDateCount = Array.from({ length: maxMonth }, (_, monthIndex) => monthIndex + 1)
    .reduce((totalCount, currentMonth) => {
      const daysMatchingMonth = Array.from({ length: maxDay - 21 }, (_, dayOffset) => dayOffset + 22)
        .filter(currentDay => {
          const dayString = String(currentDay);
          const tensDigit = Number(dayString[0]);
          const unitsDigit = Number(dayString[1]);

          return tensDigit >= 2 && unitsDigit >= 2 && tensDigit * unitsDigit === currentMonth;
        }).length;
      return totalCount + daysMatchingMonth;
    }, 0);

  displayResult(validDateCount);
}
