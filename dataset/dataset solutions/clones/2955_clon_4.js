"use strict";

const checkMonthValidity = (num) => {
  return num >= 1 && num <= 12;
};

const processDateString = (dateText) => {
  const segmentOne = Number(dateText.substring(0, 2));
  const segmentTwo = Number(dateText.substring(2));

  const validA = checkMonthValidity(segmentOne);
  const validB = checkMonthValidity(segmentTwo);

  const resultIndex = (validA << 1) | validB;

  const possibleOutputs = [
    'NA',
    'YYMM',
    'MMYY',
    'AMBIGUOUS'
  ];

  console.log(possibleOutputs[resultIndex]);
};

processDateString(require("fs").readFileSync("/dev/stdin", "utf8"));