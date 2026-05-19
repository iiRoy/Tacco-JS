const readStandardInputContent = () => {
  return require('fs').readFileSync('/dev/stdin', 'utf8');
};

const parseInputComponents = (inputLine) => {
  const trimmedLine = inputLine.trim();
  const components = trimmedLine.split(' ');
  const firstComponent = components[0];
  const secondComponent = components[1];
  return [firstComponent, secondComponent];
};

const calculateAndOutput = (rawInputString) => {
  const [firstOperandStr, secondOperandStr] = parseInputComponents(rawInputString);

  const numericSecondOperand = Number(secondOperandStr);
  const scaledSecondNumberValue = numericSecondOperand * 100;

  const bigIntFirstOperand = BigInt(firstOperandStr);
  const bigIntScaledSecondOperand = BigInt(scaledSecondNumberValue);

  const productBigInt = bigIntFirstOperand * bigIntScaledSecondOperand;

  const finalBigIntResult = productBigInt / 100n;

  const computedResultString = finalBigIntResult.toString();

  console.log(computedResultString);
};

const executeProgram = () => {
  const isTestEnvironment = process.env.MYTEST;
  if (isTestEnvironment) {
    test();
  } else {
    const stdinContent = readStandardInputContent();
    calculateAndOutput(stdinContent);
  }
};

executeProgram();
