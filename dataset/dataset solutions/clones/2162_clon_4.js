const fileSystem = require("fs");

const createInputSource = (sourcePath) => {
  const allLines = fileSystem.readFileSync(sourcePath, "utf8").trim().split("\n");
  let currentPosition = 0;
  const totalAvailable = allLines.length;

  return {
    retrieveNextEntry: () => {
      if (currentPosition >= totalAvailable) {
        throw new Error("NoSuchElementException:次に要素は無いよ");
      }
      return allLines[currentPosition++];
    },
    hasMoreEntries: () => currentPosition < totalAvailable,
  };
};

const dataStream = createInputSource("/dev/stdin");

const displayOutput = (content) => console.log(content);
const recordDiagnostic = (message) => console.error(message);

const performNumericalTransformation = () => {
  const digitSequence = dataStream.retrieveNextEntry().split('').map(Number);

  const initialProcessingState = {
    accumulatedSum: 0,
    propagatedCarry: 0,
    digitOccurrences: {},
  };

  const transformationReducer = (state, currentDigitValue, currentDigitIndex, entireSequence) => {
    state.digitOccurrences[currentDigitValue] = (state.digitOccurrences[currentDigitValue] || 0) + 1;

    if (currentDigitValue === 10) {
      recordDiagnostic("10が出てきた:" + currentDigitIndex);
    }

    const effectiveValue = currentDigitValue + state.propagatedCarry;

    if (effectiveValue >= 5) {
      state.accumulatedSum += (10 - effectiveValue);
      state.propagatedCarry = 1;
    } else {
      state.accumulatedSum += effectiveValue;
      state.propagatedCarry = 0;
    }

    return state;
  };

  const finalProcessingState = digitSequence.reduceRight(transformationReducer, initialProcessingState);

  let finalResultSum = finalProcessingState.accumulatedSum;
  if (finalProcessingState.propagatedCarry > 0) {
    finalResultSum += finalProcessingState.propagatedCarry;
  }

  displayOutput(finalResultSum);
  recordDiagnostic(finalProcessingState.digitOccurrences);
};

performNumericalTransformation();
