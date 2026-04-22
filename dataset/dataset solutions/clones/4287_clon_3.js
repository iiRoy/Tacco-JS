const acquireDataStream = () => require("fs").readFileSync("/dev/stdin", "utf8").trim();

const displayOutcome = (dataPayload) => {
  console.log(dataPayload);
};

const transformationUtilities = {
  identity: (inputStr) => inputStr,
  parseInteger: (inputStr) => Number.parseInt(inputStr, 10),
  splitByWhitespace: (inputStr) => inputStr.split(" "),
  splitByLineBreak: (inputStr) => inputStr.split("\n"),
  parseNumericArrayFromWhitespace: (inputStr) => inputStr.split(" ").map((segment) => +segment),
  parseNumericArrayFromLineBreak: (inputStr) => inputStr.split("\n").map((segment) => +segment),
  toCharArray: (inputStr) => inputStr.split(""),
  parseNumericArrayFromCharacters: (inputStr) => inputStr.split("").map((char) => +char),
};

const transformationKeyMap = {
  0: transformationUtilities.identity,
  1: transformationUtilities.parseInteger,
  2: transformationUtilities.splitByWhitespace,
  3: transformationUtilities.splitByLineBreak,
  4: transformationUtilities.parseNumericArrayFromWhitespace,
  5: transformationUtilities.parseNumericArrayFromLineBreak,
  6: transformationUtilities.toCharArray,
  7: transformationUtilities.parseNumericArrayFromCharacters,
};

const applyDataTransformation = (inputSource, transformationKey) => {
  const handler = transformationKeyMap[transformationKey];
  if (handler) {
    return handler(inputSource);
  }
  console.warn(`Unrecognized transformation key: ${transformationKey}. Returning original source.`);
  return inputSource;
};

const computeExponentialValue = (baseValue, exponentValue) => {
  if (exponentValue < 0) {
    console.error("Invalid exponent: Cannot compute power for negative exponent in this context.");
    return 0;
  }
  return Math.pow(baseValue, exponentValue);
};

const orchestrateCalculation = (rawInputContent) => {
  if (!rawInputContent || rawInputContent.trim().length === 0) {
    console.error("Fatal Error: No input content received for processing.");
    displayOutcome(0);
    return;
  }

  const linesOfData = applyDataTransformation(rawInputContent, 3);

  if (linesOfData.length < 2) {
    console.error("Input structure error: Expected at least two lines of data.");
    displayOutcome(0);
    return;
  }

  const datasetSize = applyDataTransformation(linesOfData[0], 1);

  if (Number.isNaN(datasetSize) || datasetSize < 0) {
    console.error(`Data validation error: Invalid dataset size '${linesOfData[0]}'. Must be a non-negative integer.`);
    displayOutcome(0);
    return;
  }

  const numericalSequence = applyDataTransformation(linesOfData[1], 4);

  if (numericalSequence.length !== datasetSize) {
    console.warn(`Dimensional mismatch: Declared size is ${datasetSize}, but actual sequence has ${numericalSequence.length} elements.`);
  }

  const grandTotalPermutations = computeExponentialValue(3, datasetSize);

  let evenNumberFactor = 1;

  for (let currentIdx = 0; currentIdx < datasetSize; currentIdx++) {
    const valueAtIndex = numericalSequence[currentIdx];
    if (typeof valueAtIndex === 'number' && !isNaN(valueAtIndex) && valueAtIndex % 2 === 0) {
      evenNumberFactor = evenNumberFactor * 2;
    }
  }

  const finalComputedResult = grandTotalPermutations - evenNumberFactor;

  displayOutcome(finalComputedResult);
};

orchestrateCalculation(acquireDataStream());