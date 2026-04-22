const dataAcquirer = () => {
  return require("fs").readFileSync("/dev/stdin", "utf8");
};

const processRawData = (rawText) => {
  const lineContent = rawText.split("\n");
  const headerValues = lineContent[0].match(/-?\d+/g).map(Number);
  const dataPoints = lineContent[1].match(/-?\d+/g).map(Number);

  let initialCardinality = headerValues[0];
  let chosenQuantity = headerValues[1];
  const initialDataPoints = [...dataPoints];

  let negativeValueCount = 0;
  for (const item of initialDataPoints) {
    if (item < 0) {
      negativeValueCount++;
    }
  }

  const filteredDataPoints = [];
  let zeroFound = false;
  for (const item of dataPoints) {
    if (item !== 0) {
      filteredDataPoints.push(item);
    } else {
      zeroFound = true;
    }
  }

  if (zeroFound) {
    initialCardinality--;
    chosenQuantity--;
  }

  return {
    adjustedCardinality: initialCardinality,
    adjustedQuantity: chosenQuantity,
    processedData: filteredDataPoints,
    initialNegativeCount: negativeValueCount
  };
};

const calculateMinimumSpan = (parameters) => {
  const { adjustedCardinality, adjustedQuantity, processedData, initialNegativeCount } = parameters;

  const largeConstant = 1_000_000_000 + 7;

  if (processedData.length === 0) {
    return 0;
  }

  if (adjustedCardinality === 2) {
    return Math.min(Math.abs(processedData[0]), processedData[1]);
  }

  let currentMinSpan = largeConstant;

  let startPointer = 0;
  const maxStartPointer = adjustedCardinality - adjustedQuantity;

  while (startPointer <= maxStartPointer) {
    const leftBoundary = processedData[startPointer];
    const rightBoundary = processedData[startPointer + adjustedQuantity - 1];

    if (leftBoundary < 0 && rightBoundary > 0) {
      const optionA = Math.abs(leftBoundary) * 2 + rightBoundary;
      const optionB = Math.abs(leftBoundary) + rightBoundary * 2;
      currentMinSpan = Math.min(currentMinSpan, optionA, optionB);
    } else if (startPointer === initialNegativeCount - adjustedQuantity) {
      currentMinSpan = Math.min(currentMinSpan, Math.abs(leftBoundary));
    } else if (startPointer === initialNegativeCount) {
      currentMinSpan = Math.min(currentMinSpan, rightBoundary);
    }
    startPointer++;
  }

  return currentMinSpan;
};

const outputResult = (finalOutput) => {
  process.stdout.write(finalOutput.toString() + "\n");
};

const orchestrateExecution = () => {
  const acquiredContent = dataAcquirer();
  const parsedParameters = processRawData(acquiredContent);
  const computedValue = calculateMinimumSpan(parsedParameters);
  outputResult(computedValue);
};

orchestrateExecution();