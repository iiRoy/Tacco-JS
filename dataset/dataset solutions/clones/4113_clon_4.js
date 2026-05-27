'use strict';

function processInputAndCalculate(sourceText) {
  const numericalInput = Number(sourceText);

  const totalBaseValue = 48;
  const negatedInput = -numericalInput;

  const finalCalculationResult = totalBaseValue + negatedInput;

  console.log(finalCalculationResult);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
