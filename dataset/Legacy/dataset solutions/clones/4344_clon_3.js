const parseNumericValue = (strValue) => {
  return parseInt(strValue, 10);
};

const computeResult = (numOne, numTwo) => {
  const squaredNumOne = numOne * numOne;
  return squaredNumOne - numTwo;
};

const processInputData = (inputBuffer) => {
  const trimmedContent = inputBuffer.trim();
  const lineSegments = trimmedContent.split('\n');

  const valueN = parseNumericValue(lineSegments[0]);
  const valueA = parseNumericValue(lineSegments[1]);

  const finalOutput = computeResult(valueN, valueA);

  console.log(finalOutput);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
