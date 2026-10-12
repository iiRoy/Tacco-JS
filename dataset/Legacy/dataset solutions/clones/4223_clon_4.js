"use strict";

const generateOperatorSequences = (availableOperators, sequenceLength) => {
  const totalCombinations = Math.pow(availableOperators.length, sequenceLength);
  const allSequences = [];

  for (let i = 0; i < totalCombinations; i++) {
    let currentNumber = i;
    const currentSequence = new Array(sequenceLength);
    for (let j = sequenceLength - 1; j >= 0; j--) {
      const operatorIndex = currentNumber % availableOperators.length;
      currentSequence[j] = availableOperators[operatorIndex];
      currentNumber = Math.floor(currentNumber / availableOperators.length);
    }
    allSequences.push(currentSequence);
  }
  return allSequences;
};

const calculateValue = (leftOperand, operatorSymbol, rightOperand) => {
  switch (operatorSymbol) {
    case "+":
      return leftOperand + rightOperand;
    case "-":
      return leftOperand - rightOperand;
    default:
      // This case should not be reached with the given operators
      throw new Error("Unsupported operator encountered.");
  }
};

const processInput = (inputData) => {
  const inputLine = inputData.trim().split("\n")[0];
  const num1 = parseInt(inputLine[0]);
  const num2 = parseInt(inputLine[1]);
  const num3 = parseInt(inputLine[2]);
  const num4 = parseInt(inputLine[3]);

  const opSymbols = ["+", "-"];
  const operatorCombinations = generateOperatorSequences(opSymbols, 3);

  for (const opSequence of operatorCombinations) {
    let currentResult = num1;
    currentResult = calculateValue(currentResult, opSequence[0], num2);
    currentResult = calculateValue(currentResult, opSequence[1], num3);
    currentResult = calculateValue(currentResult, opSequence[2], num4);

    if (currentResult === 7) {
      console.log(
        `${num1}${opSequence[0]}${num2}${opSequence[1]}${num3}${opSequence[2]}${num4}=7`
      );
      return;
    }
  }
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
