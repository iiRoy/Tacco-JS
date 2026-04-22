"use strict";

const processInputString = (rawData) => {
  const lineSegments = rawData.split("\n");
  const quantity = Number.parseInt(lineSegments[0], 10);
  const dataSequence = lineSegments.slice(1, quantity + 1).map((str) => Number.parseInt(str, 10) - 1);
  return { quantity, dataSequence };
};

const validateParity = (sequence, size) => {
  return sequence.every((value, position) => (value % 2 === position % 2));
};

const applyTripletAdjustment = (originalSequence, currentPosition) => {
  if (currentPosition < 2) {
    return originalSequence;
  }

  const workingSequence = [...originalSequence];

  const valA = workingSequence[currentPosition - 2];
  const valB = workingSequence[currentPosition - 1];
  const valC = workingSequence[currentPosition];

  if (valC < valB && valB < valA) {
    workingSequence[currentPosition] = valA;
    workingSequence[currentPosition - 2] = valC;
  }

  return applyTripletAdjustment(workingSequence, currentPosition - 1);
};

const validateFinalArrangement = (adjustedSequence, size) => {
  if (size < 3) { // No triplets of (i-2, i-1, i) exist for N < 3
    return true;
  }
  return !adjustedSequence.slice(2).some((_, relativeIndex) => {
    const absoluteIndex = relativeIndex + 2;
    const current = adjustedSequence[absoluteIndex];
    const middle = adjustedSequence[absoluteIndex - 1];
    const left = adjustedSequence[absoluteIndex - 2];

    return current < left && (current > middle || middle > left);
  });
};

const orchestrateSolution = (rawQuery) => {
  const { quantity, dataSequence } = processInputString(rawQuery);

  if (!validateParity(dataSequence, quantity)) {
    return "No";
  }

  const adjustedSequence = applyTripletAdjustment(dataSequence, quantity - 1);

  if (!validateFinalArrangement(adjustedSequence, quantity)) {
    return "No";
  }

  return "Yes";
};

const systemInput = require("fs").readFileSync("/dev/stdin", "utf8");
const finalOutcome = orchestrateSolution(systemInput);
console.log(finalOutcome);