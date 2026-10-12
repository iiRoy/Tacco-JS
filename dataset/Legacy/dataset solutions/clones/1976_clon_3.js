"use strict";
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenizedInput = rawData.split(/ |\n/), currentTokenIndex = 0;

function getNextValue(isString) {
  return isString ? tokenizedInput[currentTokenIndex++] : +tokenizedInput[currentTokenIndex++];
}

function getMultipleValues(count, asString) {
  var values = tokenizedInput.slice(currentTokenIndex, currentTokenIndex + count);
  currentTokenIndex += count;
  return asString ? values : values.map(val => +val);
}

function getMatrixValues(height, width, asString) {
  var matrix = [];
  for (var row = 0; row < height; row++) {
    var rowValues = tokenizedInput.slice(currentTokenIndex, currentTokenIndex + width);
    currentTokenIndex += width;
    matrix.push(asString ? rowValues : rowValues.map(val => +val));
  }
  return matrix;
}

function createMultiDimArray(initialValue) {
  var args = arguments, len = args.length, resultStr;
  resultStr = "Array(args[" + --len + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--len) {
    resultStr = "Array(args[" + len + "]).fill().map(x=>" + resultStr + ")";
  }
  return eval(resultStr);
}

var moduloConstant = 1e9 + 7;

// Helper function to calculate the weighted sum for a partition and check its validity
function calculateWeightedSum(partitionItems, isLeftPartition, rightPartitionLength) {
  var currentPartitionTotal = 0;
  for (var k = 0; k < partitionItems.length; k++) {
    var itemValue = partitionItems[k][0];
    var originalPosition = partitionItems[k][1];
    var effectiveIndexDifference;

    if (isLeftPartition) {
      // For the left partition (original 'b'), the formula is:
      // current_sorted_index + right_partition_length - original_index
      effectiveIndexDifference = k + rightPartitionLength - originalPosition;
    } else {
      // For the right partition (original 'c'), the formula is:
      // original_index - current_sorted_index
      effectiveIndexDifference = originalPosition - k;
    }

    if (effectiveIndexDifference < 0) {
      return { isValid: false, total: 0 }; // If difference is negative, arrangement is invalid
    }
    currentPartitionTotal += effectiveIndexDifference * itemValue;
  }
  return { isValid: true, total: currentPartitionTotal };
}


var finalResult = solveProblem();
if (finalResult !== undefined) {
  console.log(finalResult);
}

function solveProblem() {
  var itemCount = getNextValue();
  var initialItems = [];
  for (var currentItemIndex = 0; currentItemIndex < itemCount; currentItemIndex++) {
    initialItems.push([getNextValue(), currentItemIndex]);
  }

  var maxAchievedSum = 0;

  // Iterate through all possible split points for the array
  // 'splitPoint' represents the index where the array is divided
  for (var splitPoint = 1; splitPoint < itemCount; splitPoint++) {
    // Use slice to create the two partitions, a structural change from manual loop
    var leftPartition = initialItems.slice(0, splitPoint);
    var rightPartition = initialItems.slice(splitPoint);

    // Sort the partitions as per the problem's requirements
    leftPartition.sort((itemOne, itemTwo) => itemOne[0] - itemTwo[0]); // Sort left partition by value ascending
    rightPartition.sort((itemOne, itemTwo) => itemTwo[0] - itemOne[0]); // Sort right partition by value descending

    var currentIterationSum = 0;
    var isCurrentArrangementValid = true;

    // Calculate sum for the right partition using the helper function
    var rightPartCalculation = calculateWeightedSum(rightPartition, false, 0); // 0 is a dummy for right partition
    if (!rightPartCalculation.isValid) {
      isCurrentArrangementValid = false;
    } else {
      currentIterationSum += rightPartCalculation.total;
    }

    // Only proceed with the left partition if the right partition was valid
    if (isCurrentArrangementValid) {
      var leftPartCalculation = calculateWeightedSum(leftPartition, true, rightPartition.length);
      if (!leftPartCalculation.isValid) {
        isCurrentArrangementValid = false;
      } else {
        currentIterationSum += leftPartCalculation.total;
      }
    }

    // If the current arrangement is valid and yields a higher sum, update the maximum
    if (isCurrentArrangementValid && maxAchievedSum < currentIterationSum) {
      maxAchievedSum = currentIterationSum;
    }
  }
  return maxAchievedSum;
}
