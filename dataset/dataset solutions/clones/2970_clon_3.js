var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var dataHandler;
var inputLines = [];
inputReader.on('line', function(input){inputLines.push(input);});

function logPerformanceMetrics(startTime) {
  var elapsedTime = Date.now() - startTime;
  printDebug("time : " + (elapsedTime) + "ms");
  printDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
}

inputReader.on('close', function(){
  dataHandler = initializeInputHandler(inputLines);
  console.error("\n");
  var startTime = Date.now();
  executeMainLogic();
  logPerformanceMetrics(startTime);
});

function makeClone(obj){return JSON.parse(JSON.stringify(obj));}
function getNextInt(){return convertInput(getNext(),1);} function getNextStrArray(){return convertInput(getNext(),2);}
function getNextIntArray(){return convertInput(getNext(),4);} function getNextCharArray(){return convertInput(getNext(),6);}
function getNext(){return dataHandler.next();} function hasMoreInput(){return dataHandler.hasNext();}

function initializeInputHandler(inputBuffer){  
  var handlerInstance = {
    lineBuffer : inputBuffer, currentLineIndex : 0, totalLines : inputBuffer.length,
    hasNext : function(){return (this.currentLineIndex < this.totalLines);},
    next : function(){
      const OUT_OF_BOUNDS_ERROR = "ArrayIndexOutOfBoundsException これ以上ないよ";
      if(!this.hasNext()){
        throw OUT_OF_BOUNDS_ERROR;
      }
      var currentInputLine = this.lineBuffer[this.currentLineIndex];
      this.currentLineIndex++;
      return currentInputLine;
    }
  };
  return handlerInstance;
}

function printOutput(s){console.log(s);}
function printDebug(s){console.error("debug:" + require("util").inspect(s,false,null));}

//[conversionType]要素の扱い。数値型
//不明値、異常時:引数そのまま返す 1:数値へ変換
//2:半角SPで分割 4:半角SPで分割し、数値配列へ
//6:1文字で分割  7:1文字で分割し、数値配列へ
//8:半角SPで結合 9:改行で結合 0:文字なしで結合
function convertInput(inputValue, conversionType){
  var finalResult = inputValue;
  try{
    switch(conversionType){
      case 1:
        finalResult = parseInt(inputValue);
        break;
      case 2:
        finalResult = inputValue.split(" ");
        break;
      case 4:
        var parts = inputValue.split(" ");
        finalResult = parts.map(Number);
        break;
      case 6:
        finalResult = inputValue.split("");
        break;
      case 7:
        var chars = inputValue.split("");
        finalResult = chars.map(Number);
        break;
      case 8:
        finalResult = inputValue.join(" ");
        break;
      case 9:
        finalResult = inputValue.join("\n");
        break;
      case 0:
        finalResult = inputValue.join("");
        break;
      default:
        // finalResult remains inputValue
        break;
    }
  }catch(e){
    // finalResult remains inputValue
  }
  return finalResult;
}

function executeMainLogic(){
	var firstLineData = getNextIntArray();
	var paramM = firstLineData[0];
	var paramK = firstLineData[1];

	if(paramK === 0){
		const ARRAY_SIZE_FACTOR = 2;
		const TOTAL_ELEMENTS_COUNT = Math.pow(ARRAY_SIZE_FACTOR, paramM + 1);
		const HALF_ARRAY_ITERATIONS = Math.pow(ARRAY_SIZE_FACTOR, paramM);
		
		var resultArray = new Array(TOTAL_ELEMENTS_COUNT);
		
		for(var loopCounter = 0; loopCounter < HALF_ARRAY_ITERATIONS; loopCounter++){
			var firstIndex = loopCounter * ARRAY_SIZE_FACTOR;
			var secondIndex = firstIndex + 1;
			resultArray[firstIndex] = loopCounter;
			resultArray[secondIndex] = loopCounter;
		}
		printOutput(convertInput(resultArray, 8));
	}else{
		printOutput(-1);
	}
}
