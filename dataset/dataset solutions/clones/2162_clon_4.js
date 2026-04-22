const fileSystemInterface = require("node:fs");
const standardInputLocation = "/dev/stdin";
const characterSplitter = "";
const decimalBase = 10;
function supplyOutput(contentValue) {
  console.log(contentValue);
}
function relayDiagnostic(messageText) {
  console.error(messageText);
}
function commenceProcessing() {
  const rawDataPayload = fileSystemInterface.readFileSync(standardInputLocation, "utf8");
  const firstDataLine = rawDataPayload.trim().split("\n")[0];
  const initialNumericSequence = firstDataLine.split(characterSplitter).map(Number);
  const sequenceElementCount = initialNumericSequence.length;
  const ultimateState = recursiveDigitTransformation(
    sequenceElementCount - 1,
    initialNumericSequence,
    0,
    {}
  );
  supplyOutput(ultimateState.finalSummation);
  relayDiagnostic(ultimateState.finalFrequenciesMap);
}
function recursiveDigitTransformation(
  currentPos,
  numericUnitCollection,
  accumulatedSum,
  unitFrequencyMap
) {
  if (currentPos < 0) {
    return {
      finalSummation: accumulatedSum,
      finalFrequenciesMap: unitFrequencyMap,
    };
  }
  const currentNumericUnit = numericUnitCollection[currentPos];
  const nextFrequencyMap = { ...unitFrequencyMap };
  nextFrequencyMap[currentNumericUnit] =
    (nextFrequencyMap[currentNumericUnit] || 0) + 1;
  if (currentNumericUnit === decimalBase) {
    relayDiagnostic("Observed ten at index: " + currentPos);
  }
  let nextAccumulatedSum = accumulatedSum;
  let nextNumericUnitCollection = numericUnitCollection;
  if (currentNumericUnit >= 5) {
    nextAccumulatedSum += decimalBase - currentNumericUnit;
    nextNumericUnitCollection[currentPos] = 0;
    if (currentPos !== 0) {
      nextNumericUnitCollection[currentPos - 1]++;
    } else {
      nextAccumulatedSum++;
    }
  } else {
    nextAccumulatedSum += currentNumericUnit;
  }
  return recursiveDigitTransformation(
    currentPos - 1,
    nextNumericUnitCollection,
    nextAccumulatedSum,
    nextFrequencyMap
  );
}
commenceProcessing();