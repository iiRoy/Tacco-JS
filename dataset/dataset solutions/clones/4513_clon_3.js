var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputHandler; var inputLines = [];
inputReader.on('line', function(lineData){inputLines.push(lineData);});
inputReader.on('close', function(){
  inputHandler = initializeInputHandler(inputLines);
  console.error('\n↑入力 ↓出力');
  executeCalculation();
});
function createDeepCopy(sourceObj){return (sourceObj instanceof Set) ? new Set(Array.from(sourceObj)) : JSON.parse(JSON.stringify(sourceObj));}
function readInteger(){return convertInput(getNextToken(),1);} function readStringArray(){return convertInput(getNextToken(),2);}
function readIntegerArray(){return convertInput(getNextToken(),4);} function readCharacterArray(){return convertInput(getNextToken(),6);}
function getNextToken(){return inputHandler.next();} function hasMoreTokens(){return inputHandler.hasNext();}
function initializeInputHandler(linesArray){  
  return {
    lineList : linesArray, currentIdx : 0, maxLines : linesArray.length,
    hasNext : function(){return (this.currentIdx < this.maxLines);},
    next : function(){if(this.hasNext()){return this.lineList[this.currentIdx++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
  };
}
function printResult(data){console.log(data);}
function printDebug(data){console.error('debug:' + require('util').inspect(data,false,null));}
function convertInput(inputVal, conversionType){try{switch(conversionType){case 1:return parseInt(inputVal);case 2:return inputVal.split(' ');case 4:return inputVal.split(' ').map(Number);case 6:return inputVal.split('');case 7:return inputVal.split('').map(Number);case 8:return inputVal.join(' ');case 9:return inputVal.join('\n');case 0:return inputVal.join('');default:return inputVal;}}catch(e){return inputVal;}}

function executeCalculation(){
  var inputValues = readIntegerArray();
  var firstNum = inputValues[0];
  var secondNum = inputValues[1];
  var modulusVal = 1000000007;

  function calculateFactorialMod(numberToFactorial, currentModulus) {
    let factorialResult = 1;
    for (let loopCounter = 1; loopCounter <= numberToFactorial; loopCounter++) {
      factorialResult = (factorialResult * loopCounter) % currentModulus;
    }
    return factorialResult;
  }

  var absoluteDifference = Math.abs(firstNum - secondNum);

  if(absoluteDifference >= 2){
    printResult(0);
  }else{
    let factorialN = calculateFactorialMod(firstNum, modulusVal);
    let factorialM = calculateFactorialMod(secondNum, modulusVal);
    
    let currentProduct = (factorialN * factorialM) % modulusVal;

    if(firstNum === secondNum){
      currentProduct = (currentProduct * 2) % modulusVal;
    }
    printResult(currentProduct);
  }
}
