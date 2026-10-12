"use strict";

const dbgFlg = false;
const srcData = dbgFlg
  ? "600\n300\n220\n420"
  : require("fs")
      .readFileSync("/dev/stdin", "utf8")
      .trim();

const parseInputNumbers = (rawStringData) => {
    const stringSegments = rawStringData.split("\n");
    const numericValuesArray = [];
    for (const segment of stringSegments) {
        numericValuesArray.push(parseInt(segment, 10));
    }
    return numericValuesArray;
};

const execLogic = inStr => {
  const numArr = parseInputNumbers(inStr);

  const firstPairElements = numArr.slice(0, 2);
  const secondPairElements = numArr.slice(2, 4);

  const minValFirstSet = Math.min(...firstPairElements);
  const minValSecondSet = Math.min(...secondPairElements);

  const finalCalculatedSum = minValFirstSet + minValSecondSet;

  console.log(finalCalculatedSum);
};

execLogic(srcData);
