"use strict"

function processInput(rawData) {
  const charArray = rawData.split("");

  let resultString = "";

  const sourceLength = charArray.length;
  const iterationLimit = Math.ceil(sourceLength / 2);

  for (let idx = 0; idx < iterationLimit; idx++) {
    const currentSourceIndex = idx * 2;
    resultString += charArray[currentSourceIndex];
  }
  console.log(resultString);
}

const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
processInput(standardInputContent);
