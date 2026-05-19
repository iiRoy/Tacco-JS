var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputHandler; var inputLinesBuffer = [];
inputReader.on('line', function(input){inputLinesBuffer.push(input);});
inputReader.on('close', function(){
  inputHandler = initializeInputHandler(inputLinesBuffer);
  console.error("\n");
  var start = Date.now();
  executePrimaryLogic();
  var end = Date.now() - start;
  outputDebugError("time : " + (end) + "ms");
  outputDebugError("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function createDeepCopy(obj){return JSON.parse(JSON.stringify(obj));}
function fetchNextInteger(){return convertInputToken(fetchNextToken(),1);} function fetchNextStringArray(){return convertInputToken(fetchNextToken(),2);}
function fetchNextIntegerArray(){return convertInputToken(fetchNextToken(),4);} function fetchNextCharacterArray(){return convertInputToken(fetchNextToken(),6);}
function fetchNextToken(){return inputHandler.fetchNextToken();} function hasMoreTokens(){return inputHandler.hasMoreTokens();}
function initializeInputHandler(input){  
  return {
    list : input, index : 0, max : input.length,
    hasMoreTokens : function(){return (this.index < this.max);},
    fetchNextToken : function(){if(this.hasMoreTokens()){return this.list[this.index++];}else{throw "ArrayIndexOutOfBoundsException ‚There is no more input";}}
  };
}
function outputResult(s){console.log(s);}
function outputDebugError(s){console.error("debug:" + require("util").inspect(s,false,null));}
function convertInputToken(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}

function calculateRangeDifference(values) {
    const maxValue = Math.max.apply(null, values);
    const minValue = Math.min.apply(null, values);
    return maxValue - minValue;
}

function processOrientation(currentHeight, currentWidth, initialMinDiff) {
    let localMinDiff = initialMinDiff;

    for (let splitIndex = 1; splitIndex <= currentHeight - 2; splitIndex++) {
        const remainingHeight = currentHeight - splitIndex;

        // Scenario 1: Three vertical pieces
        const verticalPiece1 = splitIndex;
        const verticalPiece2 = Math.floor(remainingHeight / 2);
        const verticalPiece3 = Math.ceil(remainingHeight / 2);
        const diffVerticalPieces = calculateRangeDifference([verticalPiece1, verticalPiece2, verticalPiece3]);
        localMinDiff = Math.min(localMinDiff, diffVerticalPieces * currentWidth);

        // Scenario 2: One horizontal piece and two vertical pieces
        const horizontalSplitWidth1 = Math.floor(currentWidth / 2);
        const horizontalSplitWidth2 = Math.ceil(currentWidth / 2);
        const areaPiece1 = splitIndex * currentWidth;
        const areaPiece2 = remainingHeight * horizontalSplitWidth1;
        const areaPiece3 = remainingHeight * horizontalSplitWidth2;
        const diffAreaPieces = calculateRangeDifference([areaPiece1, areaPiece2, areaPiece3]);
        localMinDiff = Math.min(localMinDiff, diffAreaPieces);
    }
    return localMinDiff;
}

function executePrimaryLogic(){
  const initialDimensions = fetchNextIntegerArray();
  let currentHeight = initialDimensions[0];
  let currentWidth = initialDimensions[1];
  
  let minimumAreaDifference = 100000000000;
  
  // First orientation: H x W
  minimumAreaDifference = processOrientation(currentHeight, currentWidth, minimumAreaDifference);
  
  // Second orientation: W x H (swap dimensions)
  const tempDimensionValue = currentHeight;
  currentHeight = currentWidth;
  currentWidth = tempDimensionValue;
  minimumAreaDifference = processOrientation(currentHeight, currentWidth, minimumAreaDifference);
  
  outputResult(minimumAreaDifference);
}
