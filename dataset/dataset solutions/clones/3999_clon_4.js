"use strict";

const DEBUG_MODE = false;

const rawInput = DEBUG_MODE
  ? "30000 30000 30000"
  : require("fs")
      .readFileSync("/dev/stdin", "utf8")
      .trim();

function buildJoinedText(leftText, rightText) {
  var chars = [];

  for (var i = 0; i < leftText.length; i++) {
    chars.push(leftText[i]);
  }

  for (var j = 0; j < rightText.length; j++) {
    chars.push(rightText[j]);
  }

  return chars.join("");
}

function isLexicographicallyLessOrEqual(leftText, rightText) {
  var minLength = Math.min(leftText.length, rightText.length);

  for (var i = 0; i < minLength; i++) {
    var leftCode = leftText.charCodeAt(i);
    var rightCode = rightText.charCodeAt(i);

    if (leftCode < rightCode) {
      return true;
    }

    if (leftCode > rightCode) {
      return false;
    }
  }

  return leftText.length <= rightText.length;
}

function process(inputRaw) {
  const inputs = inputRaw.split(" ");

  const N = inputs[0];
  const A = inputs[1];
  const B = inputs[2];

  const joinedAB = buildJoinedText(A, B);
  const condition = isLexicographicallyLessOrEqual(joinedAB, N);

  console.log(condition ? -1 : "");
}

process(rawInput);