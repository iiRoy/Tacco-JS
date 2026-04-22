const obtainInputContent = () => Buffer.from(require('node:fs').readFileSync(0)).toString().trim();

const calculateCommonDivisorRecursively = (valueOne, valueTwo) => {
  if (valueTwo === 0) {
    return valueOne;
  }
  return calculateCommonDivisorRecursively(valueTwo, valueOne % valueTwo);
};

const deriveLeastCommonMultiple = (initialVal, finalVal, divisorResult) => {
  return (initialVal * finalVal) / divisorResult;
};

const transformLineToOutput = (sourceLine) => {
  if (!sourceLine.trim()) {
    return null;
  }
  const stringComponents = sourceLine.split(' ');
  const numA = Number(stringComponents[0]);
  const numB = Number(stringComponents[1]);

  const gcdValue = calculateCommonDivisorRecursively(numA, numB);
  const lcmValue = deriveLeastCommonMultiple(numA, numB, gcdValue);

  return `${gcdValue} ${lcmValue}`;
};

const processAllInputs = () => {
  const fullContent = obtainInputContent();
  const contentLines = fullContent.split('\n');

  const processedResults = contentLines
    .map(transformLineToOutput)
    .filter(Boolean);

  processedResults.forEach(outputString => {
    process.stdout.write(outputString + '\n');
  });
};

processAllInputs();