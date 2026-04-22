"use strict";
var INPUT_PROCESSOR=(function(){function makeReader(rawSourceText){return new TextParser(rawSourceText);}function TextParser(rawData){this._sourceLines=rawData.trim().split("\n");this._currentLineIndex=0;}TextParser.prototype.extractToken=function(returnRaw){var currentLineTokens=this._sourceLines,linePosition=this._currentLineIndex,extractedValue;if(typeof currentLineTokens[linePosition]==="string")currentLineTokens[linePosition]=currentLineTokens[linePosition].split(" ").reverse();extractedValue=currentLineTokens[linePosition].pop();if(!currentLineTokens[linePosition].length)this._currentLineIndex++;return returnRaw?extractedValue:+extractedValue;};TextParser.prototype.fetchLine=function(returnRaw){var lineTokens=this._sourceLines[this._currentLineIndex++].split(" ");return returnRaw?lineTokens:lineTokens.map(val=>+val);};TextParser.prototype.get2DArray=function(numLines,returnRaw){var matrixData=this._sourceLines.slice(this._currentLineIndex,this._currentLineIndex+=numLines).map(line=>line.split(" "));return returnRaw?matrixData:matrixData.map(row=>row.map(elem=>+elem));};TextParser.prototype.get1DArray=function(numLines,returnRaw){var lineArray=this._sourceLines.slice(this._currentLineIndex,this._currentLineIndex+=numLines);return returnRaw?lineArray:lineArray.map(val=>+val);};return makeReader;})();
var dataHandler=INPUT_PROCESSOR(require("fs").readFileSync("/dev/stdin","utf8"));
function generateNestedArray(initialValue){var dimensions=arguments,dimLength=dimensions.length,arrayCreationString="Array(dimensions["+--dimLength+"]).fill(0).map(_placeholder=>{return "+initialValue+";})";while(--dimLength)arrayCreationString="Array(dimensions["+dimLength+"]).fill(0).map(_placeholder=>"+arrayCreationString+")";return eval(arrayCreationString);}

var computationOutput=performCalculation();
if(computationOutput!==undefined)console.log(computationOutput);
function performCalculation(){
  var totalCount=dataHandler.extractToken();
  var rangeLimit=dataHandler.extractToken();
  var multiplier=dataHandler.extractToken();
  var processedPoints=dataHandler.get2DArray(totalCount).sort((itemA,itemB)=>itemA[0]-itemB[0]);
  var accumulatedResult=0;
  var intervalList=[],windowStart=0,accumulatedImpact=0;
  for(var itemIndex=0;itemIndex<totalCount;itemIndex++){
    while(intervalList.length>windowStart){
      if(intervalList[windowStart][0]<processedPoints[itemIndex][0]-rangeLimit)accumulatedImpact-=intervalList[windowStart][1]*multiplier,windowStart++;
      else break;
    }
    var neededQuantity=processedPoints[itemIndex][1]-accumulatedImpact*multiplier;
    if(neededQuantity<=0)continue;
    neededQuantity=Math.ceil(neededQuantity/multiplier);
    intervalList.push([processedPoints[itemIndex][0]+rangeLimit,neededQuantity]);
    accumulatedResult+=neededQuantity;
    accumulatedImpact+=neededQuantity*multiplier;
  }
  return accumulatedResult;
}