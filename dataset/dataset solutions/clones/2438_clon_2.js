"use strict";
var DataStreamProcessor=(function(){function acquireProcessor(textContent){return new StreamProcessor(textContent);}function StreamProcessor(inputString){this._contentRows=inputString.trim().split("\n");this._currentPosition=0;}StreamProcessor.prototype.pullNextToken=function(returnRaw){var segmentRef=this._contentRows,offsetRef=this._currentPosition,extractedElement;if(typeof segmentRef[offsetRef]==="string")segmentRef[offsetRef]=segmentRef[offsetRef].split(" ").reverse();extractedElement=segmentRef[offsetRef].pop();if(!segmentRef[offsetRef].length)this._currentPosition++;return returnRaw?extractedElement:+extractedElement;};StreamProcessor.prototype.retrieveLine=function(returnRaw){var parsedSegments=this._contentRows[this._currentPosition++].split(" ");return returnRaw?parsedSegments:parsedSegments.map(itemEntry=>+itemEntry);};StreamProcessor.prototype.obtainMatrix=function(lineCount,returnRaw){var resultGrid=this._contentRows.slice(this._currentPosition,this._currentPosition+=lineCount).map(itemEntry=>itemEntry.split(" "));return returnRaw?resultGrid:resultGrid.map(rowEntry=>rowEntry.map(subEntry=>+subEntry));};StreamProcessor.prototype.gatherRows=function(lineCount,returnRaw){var fetchedLines=this._contentRows.slice(this._currentPosition,this._currentPosition+=lineCount);return returnRaw?fetchedLines:fetchedLines.map(lineEntry=>+lineEntry);};return acquireProcessor;})();
var streamHandler=DataStreamProcessor(require("fs").readFileSync("/dev/stdin","utf8"));
function constructMultiArray(fillValue){var dimArgs=arguments,argIndex=dimArgs.length,generationScript="Array(dimArgs["+ --argIndex+"]).fill(0).map(x=>{return "+fillValue+";})";while(--argIndex)generationScript="Array(dimArgs["+argIndex+"]).fill(0).map(x=>"+generationScript+")";return eval(generationScript);}

console.log(performCalculation());
function performCalculation(){
  var totalItems=streamHandler.pullNextToken();
  var maxCapacity=streamHandler.pullNextToken();
  var itemData=streamHandler.obtainMatrix(totalItems);
  var dynamicResults=constructMultiArray(0,maxCapacity+3001);
  for(var currentItemIdx=0;currentItemIdx<totalItems;currentItemIdx++){
    for(var currentCapacityIdx=maxCapacity;currentCapacityIdx--;){
      if(dynamicResults[currentCapacityIdx+itemData[currentItemIdx][0]]<dynamicResults[currentCapacityIdx]+itemData[currentItemIdx][1]){
        dynamicResults[currentCapacityIdx+itemData[currentItemIdx][0]]=dynamicResults[currentCapacityIdx]+itemData[currentItemIdx][1];
      }
    }
  }
  return Math.max(...dynamicResults);
}