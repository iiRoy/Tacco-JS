"use strict";

const evaluateCondition = (sourceData) => {
  const numericComponents = sourceData.trim().split(" ").map(Number);
  const xReference = numericComponents[0];
  const aPoint = numericComponents[1];
  const bPoint = numericComponents[2];

  const difference = bPoint - aPoint;

  const decisionMatrix = [
    { test: (val, ref) => val < 0, outcome: "delicious" },
    { test: (val, ref) => val < ref, outcome: "safe" },
    { test: (val, ref) => true, outcome: "dangerous" }
  ];

  const matchedRule = decisionMatrix.find(ruleEntry => ruleEntry.test(difference, xReference));

  return matchedRule.outcome;
};

console.log(evaluateCondition(require("fs").readFileSync("/dev/stdin", "utf8")));
