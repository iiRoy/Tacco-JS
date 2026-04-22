"use strict";

const parseInputData = (rawData) => {
  const textualNumbers = rawData.trim().split(/\s+/);
  const numericalSequence = textualNumbers.slice(1).map(s => parseInt(s, 10));
  return numericalSequence;
};

const obtainMinimumOfTwo = (val1, val2) => val1 < val2 ? val1 : val2;
const obtainMinimumOfThree = (val1, val2, val3) => obtainMinimumOfTwo(val1, obtainMinimumOfTwo(val2, val3));
const obtainMinimumOfFour = (val1, val2, val3, val4) => obtainMinimumOfTwo(val1, obtainMinimumOfThree(val2, val3, val4));
const obtainMinimumOfFive = (val1, val2, val3, val4, val5) => obtainMinimumOfTwo(val1, obtainMinimumOfFour(val2, val3, val4, val5));

const processStepCosts = (previousStates, currentElement) => {
  const presentValue = currentElement;
  const costSchemeA = presentValue;
  const costSchemeB = presentValue === 0 ? 2 : presentValue % 2;
  const costSchemeC = (presentValue + 1) % 2;

  const nextState0 = previousStates[0] + costSchemeA;
  const nextState1 = obtainMinimumOfTwo(previousStates[0], previousStates[1]) + costSchemeB;
  const nextState2 = obtainMinimumOfThree(previousStates[0], previousStates[1], previousStates[2]) + costSchemeC;
  const nextState3 = obtainMinimumOfFour(previousStates[0], previousStates[1], previousStates[2], previousStates[3]) + costSchemeB;
  const nextState4 = obtainMinimumOfFive(previousStates[0], previousStates[1], previousStates[2], previousStates[3], previousStates[4]) + costSchemeA;

  return [nextState0, nextState1, nextState2, nextState3, nextState4];
};

const determineOverallMinimum = (finalCosts) => finalCosts.reduce((accumulator, value) => accumulator < value ? accumulator : value, Infinity);

const executeComputation = (sourceData) => {
  const transformedData = parseInputData(sourceData);
  const initialCostVector = [0, 0, 0, 0, 0];
  const resultantCostVector = transformedData.reduce(processStepCosts, initialCostVector);
  return determineOverallMinimum(resultantCostVector);
};

const fileAccessor = require("fs");
const standardInputLocation = "/dev/stdin";
const characterEncoding = "utf8";

const incomingContent = fileAccessor.readFileSync(standardInputLocation, characterEncoding);
const finalOutcomeValue = executeComputation(incomingContent);
process.stdout.write(finalOutcomeValue.toString() + "\n");