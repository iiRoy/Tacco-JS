var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var dataHandler;
var inputLines = [];
inputReader.on('line', function(inputLine){inputLines.push(inputLine);});
inputReader.on('close', function(){
  dataHandler = initializeInputProcessor(inputLines);
  console.error("\n");
  var startTime = Date.now();
  executeLogic();
  var endTime = Date.now() - startTime;
  printDebug("time : " + (endTime) + "ms");
  printDebug("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function createDeepCopy(sourceObj){return JSON.parse(JSON.stringify(sourceObj));}
function readInteger(){return convertInput(getNextLine(),1);} function readStringArray(){return convertInput(getNextLine(),2);}
function readIntegerArray(){return convertInput(getNextLine(),4);} function readCharacterArray(){return convertInput(getNextLine(),6);}
function getNextLine(){return dataHandler.getNextLine();} function hasMoreLines(){return dataHandler.hasMoreLines();}
function initializeInputProcessor(lines){
  var processor = {
    lineList : lines, currentIdx : 0, maxLines : lines.length,
    hasMoreLines : function(){return (this.currentIdx < this.maxLines);},
    getNextLine : function(){if(!this.hasMoreLines()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var currentLine = this.lineList[this.currentIdx];this.currentIdx++;return currentLine;}}
  };
  return processor;
}
function printOutput(content){console.log(content);}
function printDebug(message){console.error("debug:" + require("util").inspect(message,false,null));}
//[conversionType]要素の扱い。数値型
//不明値、異常時:引数そのまま返す 1:数値へ変換
//2:半角SPで分割 4:半角SPで分割し、数値配列へ
//6:1文字で分割  7:1文字で分割し、数値配列へ
//8:半角SPで結合 9:改行で結合 0:文字なしで結合
function convertInput(inputValue, conversionType){try{switch(conversionType){case 1:return parseInt(inputValue);case 2:return inputValue.split(" ");case 4:return inputValue.split(" ").map(Number);case 6:return inputValue.split("");case 7:return inputValue.split("").map(Number);case 8:return inputValue.join(" ");case 9:return inputValue.join("\n");case 0:return inputValue.join("");default:return inputValue;}}catch(e){return inputValue;}}

//↑見なくていいよ！ここまで--------------------------------------------------

// Helper function to generate the sequence when K is 0
function generateZeroKSequence(limitValue) {
    var outputArray = new Array(limitValue * 2);
    for (var currentIdx = 0; currentIdx < limitValue; currentIdx++) {
        outputArray[currentIdx * 2] = currentIdx;
        outputArray[currentIdx * 2 + 1] = currentIdx;
    }
    return outputArray;
}

// Helper function to generate the sequence when K is not 0
function generateNonZeroKSequence(targetK, limitValue) {
    var outputArray = [];
    outputArray.push(targetK);
    outputArray.push(0);

    for (var currentIdx = 1; currentIdx < limitValue; currentIdx++) {
        if (currentIdx !== targetK) {
            outputArray.push(currentIdx);
        }
    }
    outputArray.push(targetK);

    for (var currentIdx = limitValue - 1; currentIdx > 0; currentIdx--) {
        if (currentIdx !== targetK) {
            outputArray.push(currentIdx);
        }
    }
    outputArray.push(0);
    return outputArray;
}

function executeLogic(){
	var firstLineData = readIntegerArray();
	var paramM = firstLineData[0];
	var paramK = firstLineData[1];

	var maxPossibleValue = Math.pow(2, paramM);
	var isKValidRange = (paramK >= 0 && paramK < maxPossibleValue);

	if(isKValidRange){
		if(paramM === 1){
			if(paramK === 0){
				printOutput("0 0 1 1");
			}else{
				printOutput(-1);
			}
			return;
		}

		if(paramK === 0){
			var resultSequence = generateZeroKSequence(maxPossibleValue);
			printOutput(convertInput(resultSequence, 8));
		}else{
			var resultSequence = generateNonZeroKSequence(paramK, maxPossibleValue);
			printOutput(convertInput(resultSequence, 8));
		}
	}else{
		printOutput(-1);
	}
}
