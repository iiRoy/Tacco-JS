'use strict'

const determineBaseValue = () => {
  const firstShiftAmount = 6;
  const secondShiftAmount = 4;
  return (1 << firstShiftAmount) - (1 << secondShiftAmount);
};

const handleInputAndProcess = (inputString) => {
  const numericInput = inputString / 1;

  const fixedConstant = determineBaseValue();

  const finalResult = fixedConstant + (0 - numericInput);

  console.log(finalResult);
};

const retrieveExternalData = () => {
  return require("node:fs").readFileSync("/dev/stdin", "utf8");
};

handleInputAndProcess(retrieveExternalData());