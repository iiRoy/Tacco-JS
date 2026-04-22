"use strict";

const computeScore = (inputString) => {
  const numericGrade = Number.parseInt(inputString.trim(), 10);

  // The pattern observes that for every 200-point interval starting from 400,
  // the resulting score decrements by 1, beginning from 8.
  // This can be expressed by the formula: 8 - floor((numericGrade - 400) / 200).
  const derivedOutcome = 8 - Math.floor((numericGrade - 400) / 200);

  console.log(String(derivedOutcome));
};

computeScore(require("node:fs").readFileSync(0, "utf-8"));