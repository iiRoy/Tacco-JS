const convertTextToNumbers = (rawTextContent) =>
  rawTextContent.split('\n').filter(lineSegment => lineSegment.trim() !== '').map(Number);

const determineCumulativeOutcome = (numericSequence) => {
  const iterationBoundary = numericSequence[0];

  if (iterationBoundary < 2) {
      return 0;
  }

  const processingIndices = Array.from({ length: iterationBoundary - 1 }, (_, ordinal) => iterationBoundary - ordinal);

  const finalAccumulationState = processingIndices.reduce((currentAccumulator, currentPosition) => {
    if (currentAccumulator.hasError) {
      return currentAccumulator;
    }

    const elementAtCurrent = numericSequence[currentPosition];
    const elementAtPreceding = numericSequence[currentPosition - 1];

    if (elementAtCurrent >= currentPosition) {
      return { finalSum: -1, hasError: true };
    }

    const valueToAdd = (elementAtCurrent === elementAtPreceding + 1) ? 1 : elementAtCurrent;

    return {
      finalSum: currentAccumulator.finalSum + valueToAdd,
      hasError: false,
    };
  }, { finalSum: 0, hasError: false });

  return finalAccumulationState.hasError ? -1 : finalAccumulationState.finalSum;
};

const orchestrateDataProcessing = (incomingStreamData) => {
  const parsedNumericData = convertTextToNumbers(incomingStreamData);
  const computedResult = determineCumulativeOutcome(parsedNumericData);
  console.log(computedResult);
};

orchestrateDataProcessing(require("fs").readFileSync("/dev/stdin","utf8"));