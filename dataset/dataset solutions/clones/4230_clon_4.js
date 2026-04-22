"use strict";

const acquireCharCodes = (sourceString) => {
  const interimChars = Array.from(sourceString);
  const filteredChars = interimChars.filter(unit => unit !== ' ');
  const numericalValues = filteredChars.map(unit => unit.codePointAt(0));

  return {
    primaryValue: numericalValues[0],
    secondaryValue: numericalValues[1]
  };
};

const determineComparisonSymbol = (firstNum, secondNum) => {
  const comparisonIndex = Math.sign(firstNum - secondNum);

  const symbolRegistry = new Map([
    [-1, "<"],
    [0, "="],
    [1, ">"]
  ]);

  return symbolRegistry.get(comparisonIndex);
};

const processInputAndOutput = (inputData) => {
  const { primaryValue, secondaryValue } = acquireCharCodes(inputData);
  const finalSymbol = determineComparisonSymbol(primaryValue, secondaryValue);
  console.log(finalSymbol);
};

const rawData = require("fs").readFileSync("/dev/stdin", "utf8");
processInputAndOutput(rawData);