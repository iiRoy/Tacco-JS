"use strict";
var rawText = require("fs") . readFileSync("/dev/stdin", "utf8");
var dataTokens = rawText.split(/ |\n/) , tokenPointer = 0;
function acquireToken(isStr)
{
  return isStr ? dataTokens[tokenPointer++] : +dataTokens[tokenPointer++];
}
function acquireTokenSlice(count, isStr)
{
  return isStr ? dataTokens.slice(tokenPointer, tokenPointer += count) : dataTokens.slice(tokenPointer, tokenPointer += count) . map(val => +val);
}
function acquireTokenGrid(rows, cols, isStr)
{
  var gridResult = [] , rowCounter = 0;
  if (isStr)
  {
    for (; rowCounter < rows; rowCounter++)
    {
      gridResult.push(dataTokens.slice(tokenPointer, tokenPointer += cols));
    }
  }
  else
  {
    for (; rowCounter < rows; rowCounter++)
    {
      gridResult.push(dataTokens.slice(tokenPointer, tokenPointer += cols) . map(val => +val));
    }
  }
  return gridResult;
}
function buildNdimArray(defaultValue)
{
  var dimArgs = arguments, argCount = dimArgs.length,
  creationString = "Array(dimArgs[" + --argCount + "]).fill().map(x=>{return " + defaultValue + ";})";
  while (--argCount)
  {
    creationString = "Array(dimArgs[" + argCount + "]).fill().map(x=>" + creationString + ")";
  }
  return eval(creationString);
}
var IndexedTreeFactory = (function () {
  function createIndexedTree(size)
  {
    return new IndexedTree(size);
  }
  function IndexedTree(size)
  {
    this.storageArray = Array(size + 1).fill(0);
  }
  IndexedTree.prototype.performUpdate = function (valueChange, indexPos)
  {
    for (; indexPos < this.storageArray.length; indexPos += indexPos & -indexPos)
    {
      this.storageArray[indexPos] += valueChange;
    }
  };
  IndexedTree.prototype.retrieveSum = function (indexPos)
  {
    var accumulatedSum = 0;
    for (; indexPos; indexPos -= indexPos & -indexPos)
    {
      accumulatedSum += this.storageArray[indexPos];
    }
    return accumulatedSum;
  };
  return createIndexedTree;
})();
var programOutput = executeCoreLogic();
if (programOutput !== undefined)
{
  console.log(programOutput);
}
function executeCoreLogic()
{
  var sequenceSize = acquireToken();
  var characterSequence = acquireToken(1);
  var totalQueries = acquireToken();
  var charTrackerTrees = Array(26).fill().map(_ => new IndexedTreeFactory(sequenceSize));
  for (var seqCharIdx = 0; seqCharIdx < sequenceSize; seqCharIdx++)
  {
    charTrackerTrees[characterSequence[seqCharIdx].charCodeAt() - 97].performUpdate(1, seqCharIdx + 1);
  }
  var resultBuffer = [];
  for (var queryIter = 0; queryIter < totalQueries; queryIter++)
  {
    if (acquireToken() === 1)
    {
      var targetPos = acquireToken(), replacementChar = acquireToken(1);
      charTrackerTrees[characterSequence[targetPos - 1].charCodeAt() - 97].performUpdate(-1, targetPos);
      charTrackerTrees[replacementChar.charCodeAt() - 97].performUpdate(1, targetPos);
      characterSequence = characterSequence.substring(0, targetPos - 1) + replacementChar + characterSequence.substring(targetPos);
    }
    else
    {
      var leftBound = acquireToken() - 1, rightBound = acquireToken();
      var uniqueCharCount = 0;
      for (var charTypeIdx = 0; charTypeIdx < 26; charTypeIdx++)
      {
        if (charTrackerTrees[charTypeIdx].retrieveSum(rightBound) - charTrackerTrees[charTypeIdx].retrieveSum(leftBound))
        {
          uniqueCharCount++;
        }
      }
      resultBuffer.push(uniqueCharCount);
    }
  }
  return resultBuffer.join("\n");
}