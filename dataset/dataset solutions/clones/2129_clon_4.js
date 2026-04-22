"use strict"

const processData = (sourceMaterial) => {
  const rawContent = sourceMaterial.toString().trim();
  const delimiterIndex = rawContent.indexOf(' ');
  const firstComponent = parseInt(rawContent.substring(0, delimiterIndex), 10);
  const secondComponent = parseInt(rawContent.substring(delimiterIndex + 1), 10);

  const multiplierConstant = 100;
  const referenceValue = 10;

  const calculatedDifference = referenceValue - firstComponent;
  const positiveDifference = Math.max(0, calculatedDifference);
  const additionalTerm = multiplierConstant * positiveDifference;

  console.log(secondComponent + additionalTerm);
};

((executionTarget) => {
  executionTarget(require("node:fs").readFileSync("/dev/stdin", "utf8"));
})(processData);