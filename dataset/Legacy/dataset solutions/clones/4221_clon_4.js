"use strict";

function performCalculation(digitString) {
  const numericDigits = digitString.split("").map(digitChar => Number(digitChar));

  for (let combinationIndex = 0; combinationIndex < 8; combinationIndex++) {
    const operatorValues = [
      (combinationIndex & 4) ? 1 : -1,
      (combinationIndex & 2) ? 1 : -1,
      (combinationIndex & 1) ? 1 : -1
    ];

    let currentSum = numericDigits[0];
    currentSum += operatorValues[0] * numericDigits[1];
    currentSum += operatorValues[1] * numericDigits[2];
    currentSum += operatorValues[2] * numericDigits[3];

    if (currentSum === 7) {
      const operatorSymbols = operatorValues.map(val => val === 1 ? "+" : "-");
      console.log(
        `${numericDigits[0]}${operatorSymbols[0]}${numericDigits[1]}${operatorSymbols[1]}${numericDigits[2]}${operatorSymbols[2]}${numericDigits[3]}=7`
      );
      return false;
    }
  }
}

performCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));
