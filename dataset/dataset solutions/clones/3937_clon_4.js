// A: Travelling Budget - Type IV Clone
"use strict";

const DEVELOPMENT_FLAG = false;
const sourceData = DEVELOPMENT_FLAG
  ? "600\n300\n220\n420"
  : require("node:fs")
      .readFileSync("/dev/stdin", "utf8")
      .trim();

// Custom comparison function for two values
const selectLesser = (valA, valB) => (valA < valB ? valA : valB);

// Core calculation logic
const computeExpenditure = (incomeText) => {
  const collectedFigures = [];
  let currentNumAccumulator = "";

  for (let i = 0; i < incomeText.length; i++) {
    const charUnit = incomeText[i];
    // Check if the character is a digit
    if (charUnit >= '0' && charUnit <= '9') {
      currentNumAccumulator += charUnit;
    } else if (currentNumAccumulator.length > 0) {
      // If it's not a digit and we have accumulated a number, push it
      collectedFigures.push(Number(currentNumAccumulator));
      currentNumAccumulator = ""; // Reset for the next number
    }
  }
  // After the loop, add the last accumulated number if any
  if (currentNumAccumulator.length > 0) {
    collectedFigures.push(Number(currentNumAccumulator));
  }

  // Calculate the sum of minimums using our custom function
  const firstCategoryMin = selectLesser(collectedFigures[0], collectedFigures[1]);
  const secondCategoryMin = selectLesser(collectedFigures[2], collectedFigures[3]);

  const finalSum = firstCategoryMin + secondCategoryMin;

  console.log(finalSum);
};

computeExpenditure(sourceData);