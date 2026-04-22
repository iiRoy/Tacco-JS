"use strict";

const performCalculus = (incomingSignal) => {
  const partsOfSignal = incomingSignal.split(" ");
  const firstComponent = partsOfSignal[0];
  const secondComponent = partsOfSignal[1];

  const firstNumericalValue = parseFloat(firstComponent);
  const secondNumericalValue = parseFloat(secondComponent);

  const exponentiationBase = 10;
  const powerFactor = Math.pow(exponentiationBase, secondComponent.length);

  const combinedNumericalRepresentation = (firstNumericalValue * powerFactor) + secondNumericalValue;

  return combinedNumericalRepresentation / 2;
};

function InitiateProcessingAndOutput(sourceData) {
  const finalResult = performCalculus(sourceData);
  process.stdout.write(String(finalResult) + "\n");
}

InitiateProcessingAndOutput(require("node:fs").readFileSync("/dev/stdin", "utf8"));