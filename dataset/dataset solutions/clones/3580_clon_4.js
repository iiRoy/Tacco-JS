const moduleFile = require("fs");

const obtainParsedData = (inputPath) => {
  const contentRaw = moduleFile.readFileSync(inputPath, "utf8");
  const contentLines = contentRaw.split("\n");
  const convertedValues = contentLines.map(line => Number(line));
  return convertedValues;
};

const dataset = obtainParsedData("/dev/stdin");

const rejectResult = "No";
const acceptResult = "Yes";

const processInternalSegment = (
  currentCursorPosition,
  segmentExtentCeiling,
  segmentExtentFloor,
  dataSeries,
  totalDataPoints
) => {
  if (currentCursorPosition >= segmentExtentCeiling) {
    return { outcome: true, finalCursor: currentCursorPosition, newCeiling: segmentExtentCeiling, newFloor: segmentExtentFloor };
  }

  const nextCursorStepOne = currentCursorPosition + 1;
  if (nextCursorStepOne > totalDataPoints || dataSeries[nextCursorStepOne] !== nextCursorStepOne) {
    return { outcome: false };
  }

  const nextCursorStepTwo = nextCursorStepOne + 1;
  if (nextCursorStepTwo > totalDataPoints || ((dataSeries[nextCursorStepTwo] ^ nextCursorStepTwo) & 1)) {
    return { outcome: false };
  }

  let updatedCeiling = segmentExtentCeiling;
  let updatedFloor = segmentExtentFloor;

  if (updatedCeiling < dataSeries[nextCursorStepTwo]) {
    updatedCeiling = dataSeries[nextCursorStepTwo];
  } else if (nextCursorStepTwo > dataSeries[nextCursorStepTwo] && updatedFloor < dataSeries[nextCursorStepTwo]) {
    updatedFloor = dataSeries[nextCursorStepTwo];
  } else {
    return { outcome: false };
  }

  return processInternalSegment(
    nextCursorStepTwo,
    updatedCeiling,
    updatedFloor,
    dataSeries,
    totalDataPoints
  );
};

const evaluateSequenceStructure = (
  currentElementPointer,
  entireDataCollection,
  maximumDataElementIndex
) => {
  if (currentElementPointer > maximumDataElementIndex) {
    return acceptResult;
  }

  if (((entireDataCollection[currentElementPointer] ^ currentElementPointer) & 1)) {
    return rejectResult;
  }

  const initialSegmentExtentCeiling = entireDataCollection[currentElementPointer];
  const initialSegmentExtentFloor = currentElementPointer;

  const segmentProcessingResult = processInternalSegment(
    currentElementPointer,
    initialSegmentExtentCeiling,
    initialSegmentExtentFloor,
    entireDataCollection,
    maximumDataElementIndex
  );

  if (!segmentProcessingResult.outcome) {
    return rejectResult;
  }

  return evaluateSequenceStructure(segmentProcessingResult.finalCursor + 1, entireDataCollection, maximumDataElementIndex);
};

const executeStructuralCheck = (allInputNumbers) => {
  const quantityOfElements = allInputNumbers[0];
  return evaluateSequenceStructure(1, allInputNumbers, quantityOfElements);
};

console.log(executeStructuralCheck(dataset));