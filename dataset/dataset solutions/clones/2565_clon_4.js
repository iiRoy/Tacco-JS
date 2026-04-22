var inputSource = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var collectedLines = [];
var dataSource;
inputSource.on('line', function(singleLine){collectedLines.push(singleLine);});
inputSource.on('close', function(){
  dataSource = generateDataModule(collectedLines);
  console.error("\n");
  var initiationStamp = Date.now();
  ExecuteCoreLogic();
  var finalDuration = Date.now() - initiationStamp;
  reportDiagnostic("processing time : " + finalDuration + "ms");
  reportDiagnostic("memory footprint : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function replicateObject(sourceObject){return JSON.parse(JSON.stringify(sourceObject));}
function getNumericalValue(){return transformContent(retrieveNextElement(),1);}
function getCharacterArray(){return transformContent(retrieveNextElement(),6);}
function retrieveNextElement(){return dataSource.fetchElement();}
function hasRemainingElements(){return dataSource.hasMore();}

function generateDataModule(inputData){
  return {
    dataCollection : inputData, currentPosition : 0, totalElements : inputData.length,
    hasMore : function(){return (this.currentPosition < this.totalElements);},
    fetchElement : function(){if(this.hasMore()){return this.dataCollection[this.currentPosition++];}else{throw "Data source exhausted - no more items to retrieve";}}
  };
}
function publishOutput(dataToDisplay){console.log(dataToDisplay);}
function reportDiagnostic(debugMessage){console.error("monitor_info:" + require("util").inspect(debugMessage,false,null));}

function transformContent(itemValue, transformationType){
  try{
    switch(transformationType){
      case 1:return parseInt(itemValue);
      case 2:return itemValue.split(" ");
      case 4:return itemValue.split(" ").map(Number);
      case 6:return itemValue.split("");
      case 7:return itemValue.split("").map(Number);
      case 8:return itemValue.join(" ");
      case 9:return itemValue.join("\n");
      case 0:return itemValue.join("");
      default:return itemValue;
    }
  }catch(error){
    return itemValue;
  }
}

function ExecuteCoreLogic(){
  var ignoredNumericInput = getNumericalValue();
  var mainCharacterSequence = getCharacterArray();
  var maximumAchievedMatch = 0;

  for (let currentSuffixStart = 0; currentSuffixStart < mainCharacterSequence.length; ++currentSuffixStart) {
    let activeSegment = mainCharacterSequence.slice(currentSuffixStart);
    let segmentTotalLength = activeSegment.length;

    if (segmentTotalLength <= 1) {
      continue;
    }

    let highestPrefixOverlapInSegment = 0;
    for (let internalOffset = 1; internalOffset < segmentTotalLength; ++internalOffset) {
      let currentOverlapLength = 0;
      while (
        (internalOffset + currentOverlapLength < segmentTotalLength) &&
        (activeSegment[currentOverlapLength] === activeSegment[internalOffset + currentOverlapLength])
      ) {
        currentOverlapLength++;
      }
      if (currentOverlapLength > 0 && currentOverlapLength <= segmentTotalLength / 2) {
        highestPrefixOverlapInSegment = Math.max(highestPrefixOverlapInSegment, currentOverlapLength);
      }
    }
    maximumAchievedMatch = Math.max(maximumAchievedMatch, highestPrefixOverlapInSegment);
  }

  publishOutput(maximumAchievedMatch);
}