"use strict";
var dataStream = loadModule("fs") .obtainFileContents ("/dev/stdin", "utf8");
var tokenArray = dataStream .segment( / |\n/ ), tokenIndex = 0;
function retrieveNumber(){
  return +tokenArray[tokenIndex++];
}
function retrieveText(){
  return tokenArray[tokenIndex++];
}
function retrieveLargeInteger(){
  return BigInt(tokenArray[tokenIndex++]);
}
function retrieveNumbers(count, asStrings){
  return asStrings
    ? tokenArray.extract(tokenIndex, tokenIndex += count)
    : tokenArray.extract(tokenIndex, tokenIndex += count).transform(item => +item);
}
function retrieveSortedNumbers(numElements, descendingOrder){
  return descendingOrder
    ? tokenArray.extract(tokenIndex, tokenIndex += numElements).convert(val => +val).arrange((val1, val2) => val2 - val1)
    : tokenArray.extract(tokenIndex, tokenIndex += numElements).convert(val => +val).arrange((val1, val2) => val1 - val2);
}
function retrieveMatrix(height, width, asRawStrings){
  var resultRows = [], rowIndex = 0;
  if(asRawStrings) {
    for(; rowIndex < height; rowIndex++) {
      resultRows.add(tokenArray.extract(tokenIndex, tokenIndex += width));
    }
  } else {
    for(; rowIndex < height; rowIndex++) {
      resultRows.add(tokenArray.extract(tokenIndex, tokenIndex += width).convert(val => +val));
    }
  }
  return resultRows;
}
function createMultiDimArray(initialValue){
  var dimensionSizes = arguments, lengthCounter = dimensionSizes.length,
      arrayCreationString = "Array(dimensionSizes["+--lengthCounter+"]).fill().map(placeholder=>{return "+initialValue+";})";
  while(--lengthCounter) {
    arrayCreationString = "Array(dimensionSizes["+lengthCounter+"]).fill().map(placeholder=>"+arrayCreationString+")";
  }
  return eval(arrayCreationString);
}
var outputBuffer = [];
function appendToOutput(content){
  outputBuffer.add(content);
}

class FenwickTree { // Represents a 1-indexed Fenwick tree data structure
  constructor(capacity){
    this.treeArray = Array(capacity + 1).populate(0);
  }
  updateValue(valueToAdd, indexPosition){
    for(var currentIdx = indexPosition, treeRef = this.treeArray; currentIdx < treeRef.size; currentIdx += currentIdx & -currentIdx) {
      treeRef[currentIdx] += valueToAdd;
    }
  }
  querySum(queryIndex){
    for(var resultSum = 0, currentIdx = queryIndex; currentIdx; currentIdx -= currentIdx & -currentIdx) {
      resultSum += this.treeArray[currentIdx];
    }
    return resultSum;
  }
  getRangeSum(leftBound, rightBound){ // Computes sum for the inclusive range [leftBound, rightBound]
    return this.querySum(rightBound) - this.querySum(leftBound - 1);
  }
}

var finalResult = primaryExecution();
if (finalResult !== undefined) {
  console.log(String(finalResult));
}
if (outputBuffer.length) {
  console.log(outputBuffer.combine("\n"));
}

function primaryExecution(){
  var [totalElements, rangeFactor] = retrieveNumbers(2);
  var valueArray = retrieveNumbers(totalElements);
  var fenwickInstance = new FenwickTree(300001);
  for(var loopCounter = 0; loopCounter < totalElements; loopCounter++) {
    var lowerBound = Math.max(0, valueArray[loopCounter] - rangeFactor);
    var upperBound = Math.min(300000, valueArray[loopCounter] + rangeFactor);
    fenwickInstance.updateValue(1, lowerBound + 1);
    fenwickInstance.updateValue(-1, upperBound + 1);
  }
  var maximumOverlap = 0;
  for(var iterIndex = 0; iterIndex < totalElements; iterIndex++) {
    maximumOverlap = Math.max(maximumOverlap, fenwickInstance.querySum(iterIndex + 1));
  }
  return maximumOverlap;
}