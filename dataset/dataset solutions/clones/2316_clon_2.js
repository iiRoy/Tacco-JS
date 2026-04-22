"use strict";
var InputParser=(function(){function createProcessor(sourceContent){return new TextProcessor(sourceContent);}function TextProcessor(sourceContent){this.inputLines=sourceContent.trim().split("\n");this.currentLineIdx=0;}TextProcessor.prototype.fetchValue=function(asString){let lineData=this.inputLines[this.currentLineIdx];let extractedItem;if(typeof lineData==="string"){lineData=lineData.split(" ").reverse();this.inputLines[this.currentLineIdx]=lineData;}extractedItem=lineData.pop();if(!lineData.length){this.currentLineIdx++;}return asString?extractedItem:+extractedItem;};TextProcessor.prototype.fetchLine=function(asString){let lineData=this.inputLines[this.currentLineIdx++].split(" ");return asString?lineData:lineData.map(itemVal=>+itemVal);};TextProcessor.prototype.fetchMatrix=function(numLines,asString){let resultRows=this.inputLines.slice(this.currentLineIdx,this.currentLineIdx+=numLines).map(rowStr=>rowStr.split(" "));return asString?resultRows:resultRows.map(row=>row.map(itemVal=>+itemVal));};TextProcessor.prototype.fetchRows=function(numLines,asString){let extractedRows=this.inputLines.slice(this.currentLineIdx,this.currentLineIdx+=numLines);return asString?extractedRows:extractedRows.map(itemVal=>+itemVal);};return createProcessor;})();
var dataStream=InputParser(require("fs").readFileSync("/dev/stdin","utf8"));
function makeMultiArray(initialValue){var dimensions=arguments,dimCount=dimensions.length,arrayConstructionCode="Array(dimensions["+ --dimCount+"]).fill(0).map(_=>{return "+initialValue+";})";while(--dimCount)arrayConstructionCode="Array(dimensions["+dimCount+"]).fill(0).map(_=>"+arrayConstructionCode+")";return eval(arrayConstructionCode);}
console.log(executeSolution());
function executeSolution(){
  var totalItems=dataStream.fetchValue(),thresholdDelta=dataStream.fetchValue(),requiredVotes=dataStream.fetchValue(),protectedCount=dataStream.fetchValue();
  var itemValues=dataStream.fetchLine();
  itemValues.sort((valA,valB)=>valA-valB);
  var upperBound=totalItems-protectedCount,lowerBound=-1;
  while(upperBound-lowerBound>1){
    var candidateIndex=(upperBound+lowerBound+1)>>1;
    var adjustedThreshold=itemValues[candidateIndex]+thresholdDelta;
    if(adjustedThreshold<itemValues[totalItems-protectedCount]){
      lowerBound=candidateIndex;
    }else if(requiredVotes<=candidateIndex+protectedCount){
      upperBound=candidateIndex;
    }else{
      var remainingVotes=(requiredVotes-candidateIndex-protectedCount)*thresholdDelta;
      for(var idx=candidateIndex+1;remainingVotes>0&&idx<totalItems-protectedCount+1;idx++){
        remainingVotes-=adjustedThreshold-itemValues[idx];
      }
      if(remainingVotes<=0)upperBound=candidateIndex;
      else lowerBound=candidateIndex;
    }
  }
  return totalItems-upperBound;
}