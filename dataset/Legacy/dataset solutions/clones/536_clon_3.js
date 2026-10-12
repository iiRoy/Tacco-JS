"use strict";

function ProcessInput(rawData) {
  const inputSegments = rawData.split(" ");

  const firstParsedValue = parseFloat(inputSegments[0]);
  const secondParsedValue = parseFloat(inputSegments[1]);

  function calculateMean(valueOne, valueTwo) {
    const sumOfNumbers = valueOne + valueTwo;
    const arithmeticMean = sumOfNumbers / 2;
    return arithmeticMean;
  }

  const finalResult = calculateMean(firstParsedValue, secondParsedValue);
  console.log(finalResult);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
