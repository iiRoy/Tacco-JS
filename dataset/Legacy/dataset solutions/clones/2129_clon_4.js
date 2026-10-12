"use strict";

const computeOutcome = (rawText) => {
  const numericalComponents = rawText.trim().split(' ').map(Number);

  const primaryValue = numericalComponents[0];
  const secondaryValue = numericalComponents[1];

  const adjustmentFactor = Math.max(0, 10 - primaryValue);
  const finalResult = secondaryValue + (adjustmentFactor * 100);

  console.log(finalResult);
};

computeOutcome(require("fs").readFileSync("/dev/stdin", "utf8"));
