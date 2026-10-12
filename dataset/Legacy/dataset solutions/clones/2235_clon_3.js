"use strict";

function processInput(rawInputData) {
  const inputLineArray = rawInputData.split('\n');
  const containerHeight = Number(inputLineArray[0]);
  const containerWidth = Number(inputLineArray[1]);
  const requiredItems = Number(inputLineArray[2]);

  // The original code had an if/else block where both branches performed the exact same calculation and logging.
  // This conditional structure is redundant for the observable behavior.
  // We simplify by removing the unnecessary conditional logic and directly performing the calculation.

  const itemsPerHeightUnit = requiredItems / containerHeight;
  const calculatedCeilingValue = Math.ceil(itemsPerHeightUnit);
  
  console.log(calculatedCeilingValue);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
