"use strict";
var rawData = require("fs").readFileSync("/dev/stdin","utf8");
var tokenizedInput = rawData.split(/ |\n/), tokenIndex = 0;

function readInt(){ return +tokenizedInput[tokenIndex++]; }
function readString(){ return tokenizedInput[tokenIndex++]; }
function readBigInt(){ return BigInt(tokenizedInput[tokenIndex++]); }

function readInts(count, returnStrings){
  var startIndex = tokenIndex;
  tokenIndex += count;
  var slicedTokens = tokenizedInput.slice(startIndex, tokenIndex);
  return returnStrings ? slicedTokens : slicedTokens.map(val => +val);
}

function readSortedInts(count, descendingOrder){
  var startIndex = tokenIndex;
  tokenIndex += count;
  var numericTokens = tokenizedInput.slice(startIndex, tokenIndex).map(val => +val);
  return descendingOrder ? numericTokens.sort((a,b)=>b-a) : numericTokens.sort((a,b)=>a-b);
}

function readMatrix(height, width, asStrings){
  var resultMatrix = [];
  for(var rowIdx = 0; rowIdx < height; rowIdx++) {
    var rowTokens = tokenizedInput.slice(tokenIndex, tokenIndex += width);
    resultMatrix.push(asStrings ? rowTokens : rowTokens.map(val => +val));
  }
  return resultMatrix;
}

function createMultiDimArray(initialValue){
  var args = arguments, argCount = args.length;
  var currentExpression = "Array(args["+ --argCount +"]).fill().map(x=>{return "+initialValue+";})";
  while(--argCount) currentExpression = "Array(args["+argCount+"]).fill().map(x=>"+currentExpression+")";
  return eval(currentExpression);
}

var outputBuffer = [];
function addToOutputBuffer(content){ outputBuffer.push(content); }

var defaultValue = 0;

function SegmentTree(size){
  var powerOfTwoSize = 2;
  var tempSize = size - 1;
  while(tempSize > 0) {
    tempSize >>= 1;
    powerOfTwoSize <<= 1;
  }
  this.treeArray = Array(powerOfTwoSize - 1).fill(defaultValue);
  this.leafOffset = powerOfTwoSize >> 1;
}

SegmentTree.prototype = {
  queryMax: function(targetIndex){
    var currentTree = this.treeArray;
    var searchIndex = targetIndex + this.leafOffset - 1;
    var maxFoundValue = defaultValue;
    while(searchIndex >= 0){
      if(currentTree[searchIndex] > maxFoundValue) {
        maxFoundValue = currentTree[searchIndex];
      }
      searchIndex = Math.floor((searchIndex - 1) / 2);
    }
    return maxFoundValue;
  },

  rangeUpdate: function(leftBound, rightBound, updateValue){
    if(leftBound >= rightBound) {
      return;
    }
    var instanceRef = this;
    
    function performRecursiveUpdate(currentLeft, currentRight, nodeStart, nodeEnd, nodeIndex){
      if(currentLeft === nodeStart && currentRight === nodeEnd){
        if(instanceRef.treeArray[nodeIndex] < updateValue) {
          instanceRef.treeArray[nodeIndex] = updateValue;
        }
        return;
      }
      var midPoint = Math.floor((nodeStart + nodeEnd) / 2);
      
      var leftChildIndex = nodeIndex * 2 + 1;
      var rightChildIndex = nodeIndex * 2 + 2;

      if (currentRight <= midPoint) {
          performRecursiveUpdate(currentLeft, currentRight, nodeStart, midPoint, leftChildIndex);
      } else if (currentLeft >= midPoint) {
          performRecursiveUpdate(currentLeft, currentRight, midPoint, nodeEnd, rightChildIndex);
      } else {
          performRecursiveUpdate(currentLeft, midPoint, nodeStart, midPoint, leftChildIndex);
          performRecursiveUpdate(midPoint, currentRight, midPoint, nodeEnd, rightChildIndex);
      }
    }
    
    performRecursiveUpdate(leftBound, rightBound, 0, this.leafOffset, 0);
  },
};

var finalResult = solveProblem();
if(finalResult !== undefined) console.log(String(finalResult));
if(outputBuffer.length) console.log(outputBuffer.join("\n"));

function solveProblem(){
  const MAX_COORDINATE_VALUE = 300000;
  const SEGMENT_TREE_CAPACITY = MAX_COORDINATE_VALUE + 1;

  var [numElements, rangeK] = readInts(2);
  var inputArray = readInts(numElements);

  var segmentTreeInstance = new SegmentTree(SEGMENT_TREE_CAPACITY);

  for(var elementIdx = 0; elementIdx < numElements; elementIdx++){
    var currentElementValue = inputArray[elementIdx];

    var effectiveLowerBound = Math.max(0, currentElementValue - rangeK);
    var effectiveUpperBound = Math.min(MAX_COORDINATE_VALUE, currentElementValue + rangeK);
    
    var currentMaxSequenceLength = segmentTreeInstance.queryMax(currentElementValue);
    
    var nextSequenceLength = currentMaxSequenceLength + 1;
    segmentTreeInstance.rangeUpdate(effectiveLowerBound, effectiveUpperBound + 1, nextSequenceLength);
  }

  var overallMaxAnswer = 0;
  for(var coordIdx = 0; coordIdx <= MAX_COORDINATE_VALUE; coordIdx++){
    var valueAtCurrentCoord = segmentTreeInstance.queryMax(coordIdx);
    overallMaxAnswer = Math.max(overallMaxAnswer, valueAtCurrentCoord);
  }
  return overallMaxAnswer;
}
