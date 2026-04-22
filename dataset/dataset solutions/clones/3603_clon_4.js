const pipelineUtility = (...functions) => (initialValue) =>
  functions.reduce((accumulator, currentFunction) => currentFunction(accumulator), initialValue);

const retrieveSourceData = () => require("fs").readFileSync("/dev/stdin", "utf8");

const interpretAndExtractNumerics = (rawText) => {
  const tokenSegments = rawText.match(/\S+/g) || [];
  const firstNumeric = Number(tokenSegments[0]);
  const secondNumeric = Number(tokenSegments[1]);
  return [firstNumeric, secondNumeric];
};

const performExpandedCalculation = ([operandAlpha, operandBeta]) => {
  return (operandAlpha * operandBeta) - operandAlpha - operandBeta + 1;
};

const outputFinalResult = (computedValue) => console.log(computedValue);

const processAndDisplaySystemInput = pipelineUtility(
  retrieveSourceData,
  interpretAndExtractNumerics,
  performExpandedCalculation,
  outputFinalResult
);

processAndDisplaySystemInput();