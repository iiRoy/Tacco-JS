"use strict";
function ProcessInput(inputString) {
  const sourceWords = ["dream", "dreamer", "erase", "eraser"];

  const reversedSourceWords = sourceWords.map(strValue => reverseString(strValue));

  const reversedInput = reverseString(inputString);

  function findDecomposition(currentSegment) {
    if (currentSegment === "") {
      return true;
    }

    for (const pattern of reversedSourceWords) {
      if (currentSegment.startsWith(pattern)) {
        const remainingSegment = currentSegment.substring(pattern.length);
        if (findDecomposition(remainingSegment)) {
          return true;
        }
      }
    }

    return false;
  }

  if (findDecomposition(reversedInput)) {
    console.log("YES");
  } else {
    console.log("NO");
  }
}

function reverseString(strValue) {
  return strValue.split("").reverse().join("");
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf-8"));
