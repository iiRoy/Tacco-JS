const parseTwoNumbers = (lineContent) => {
  const numberStringParts = lineContent.split(' ');
  const firstParsedNum = parseInt(numberStringParts[0], 10);
  const secondParsedNum = parseInt(numberStringParts[1], 10);
  return [firstParsedNum, secondParsedNum];
};

const executeProgram = (rawInputData) => {
  const trimmedInput = rawInputData.trim();
  const inputLines = trimmedInput.split('\n');

  const targetLine = inputLines[0];
  const [operandA, operandB] = parseTwoNumbers(targetLine);

  let finalResult;
  const isPerfectlyDivisible = (operandB % operandA === 0);

  if (isPerfectlyDivisible) {
    finalResult = operandA + operandB;
  } else {
    finalResult = operandB - operandA;
  }

  console.log(finalResult);
};

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
