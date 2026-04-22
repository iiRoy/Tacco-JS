var read = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputProcessor; var inputLines = [];
read.on('line', function(lineContent){inputLines.push(lineContent);});
read.on('close', function(){
  inputProcessor = initializeInput(inputLines);
  console.error("\n");
  var beginTime = Date.now();
  ExecutePrincipalLogic();
  var elapsedTime = Date.now() - beginTime;
  writeDebug("processing_duration : " + (elapsedTime) + "ms");
  writeDebug("memory_usage : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function createDeepCopy(sourceObject){return JSON.parse(JSON.stringify(sourceObject));}
function getNextInteger(){return convertInput(retrieveNext(),1);}
function getNextStringArray(){return convertInput(retrieveNext(),2);}
function getNextIntegerArray(){return convertInput(retrieveNext(),4);}
function getNextCharArray(){return convertInput(retrieveNext(),6);}
function retrieveNext(){return inputProcessor.fetchNext();}
function checkMoreInput(){return inputProcessor.hasMore();}
function initializeInput(dataLines){  
  var parserObject = {
    content : dataLines, currentPos : 0, limit : dataLines.length,
    hasMore : function(){return (this.currentPos < this.limit);},
    fetchNext : function(){if(!this.hasMore()){throw "InputBoundaryExceeded";}else{var lineData = this.content[this.currentPos++];return lineData;}}
  };
  return parserObject;
}
function writeOutput(text){console.log(text);}
function writeDebug(text){console.error("debug_info:" + require("util").inspect(text,false,null));}
function convertInput(data, type){try{switch(type){case 1:return parseInt(data);case 2:return data.split(" ");case 4:return data.split(" ").map(Number);case 6:return data.split("");case 7:return data.split("").map(Number);case 8:return data.join(" ");case 9:return data.join("\n");case 0:return data.join("");default:return data;}}catch(e){return data;}}

function processSequence(numElements, elementList) {
    let totalAccumulator = 0;
    let currentLeftBound = 0;
    const bitLastPosition = new Array(32).fill(-1); 

    for (let currentRightIndex = 0; currentRightIndex < numElements; ++currentRightIndex) {
        const currentElement = elementList[currentRightIndex];
        
        for (let bitPosition = 0; bitPosition < 32; ++bitPosition) {
            if ((currentElement >> bitPosition) & 1) { 
                if (bitLastPosition[bitPosition] >= currentLeftBound) {
                    currentLeftBound = bitLastPosition[bitPosition] + 1;
                }
                bitLastPosition[bitPosition] = currentRightIndex;
            }
        }
        totalAccumulator += (currentRightIndex - currentLeftBound + 1);
    }
    return totalAccumulator;
}

function ExecutePrincipalLogic(){
  var countOfElements = getNextInteger();
  var numericArray = getNextIntegerArray();
  var finalResult = processSequence(countOfElements, numericArray);
  writeOutput(finalResult);
}