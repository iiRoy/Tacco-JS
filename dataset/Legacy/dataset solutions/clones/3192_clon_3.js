"use strict";

const sortDescending = (arrParam) => arrParam.sort((valA, valB) => valB - valA);

const parseStringAsInteger = (strVal) => parseInt(strVal, 10);

const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");

const inputLinesArray = rawInputData.split("\n");

const initialElementCount = parseStringAsInteger(inputLinesArray[0]);

const stringifiedNumbers = inputLinesArray[1].split(" ");
const parsedNumericValues = stringifiedNumbers.map(parseStringAsInteger);
const numericCollection = sortDescending(parsedNumericValues);

while (numericCollection.length > 1) {
  const currentTopValue = numericCollection[0];
  const nextTopValue = numericCollection[1];

  const computedRemainder = currentTopValue % nextTopValue;

  if (computedRemainder === 0) {
    numericCollection.shift();
  } else {
    numericCollection[0] = computedRemainder;
    sortDescending(numericCollection);
  }
}

console.log(numericCollection[0]);
