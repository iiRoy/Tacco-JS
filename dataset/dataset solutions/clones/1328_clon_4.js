"use strict";

process.stdin.resume();
process.stdin.setEncoding("utf8");

var inputLines = [];

var inputReader = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on("line", function(lineContent) {
  inputLines.push(lineContent);
});

inputReader.on("close", function() {
  var currentInputIndex = 0;

  while (currentInputIndex < inputLines.length) {
    var currentInputSegment = inputLines[currentInputIndex].trim();

    if (currentInputSegment === "-") {
      break;
    }

    var initialCharacterArray = currentInputSegment.split("");
    currentInputIndex++;

    var numberOfOperations = Number(inputLines[currentInputIndex]);
    currentInputIndex++;

    var rotationAmounts = [];

    for (var operationIndex = 0; operationIndex < numberOfOperations; operationIndex++) {
      rotationAmounts.push(Number(inputLines[currentInputIndex]));
      currentInputIndex++;
    }

    console.log(performCompressedRotation(initialCharacterArray, rotationAmounts).join(""));
  }
});

function performCompressedRotation(characterArray, rotationAmounts) {
  var sequenceLength = characterArray.length;

  if (sequenceLength === 0) {
    return characterArray;
  }

  var totalEffectiveShift = 0;

  for (var i = 0; i < rotationAmounts.length; i++) {
    totalEffectiveShift += normalizeShiftLikeOriginalSlice(
      rotationAmounts[i],
      sequenceLength
    );
  }

  var finalShift = totalEffectiveShift % sequenceLength;

  return characterArray
    .slice(finalShift, sequenceLength)
    .concat(characterArray.slice(0, finalShift));
}

function normalizeShiftLikeOriginalSlice(operationValue, sequenceLength) {
  /*
   * Original per operation:
   * s = s.slice(op, len).concat(s.slice(0, op));
   *
   * For normal contest inputs, op is usually 0 <= op < len.
   * But this preserves edge cases too:
   *   op >= len   -> no visible change
   *   op <= -len  -> no visible change
   *   op < 0      -> behaves like right rotation
   */
  if (operationValue >= sequenceLength || operationValue <= -sequenceLength) {
    return 0;
  }

  if (operationValue < 0) {
    return sequenceLength + operationValue;
  }

  return operationValue;
}