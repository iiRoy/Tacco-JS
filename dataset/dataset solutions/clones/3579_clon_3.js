const NO_RESULT_STR = "No";
const YES_RESULT_STR = "Yes";

const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
const numericSequence = rawInputContent.split("\n").map(value => +value);

console.log(processInputSequence());

function processInputSequence() {
  const sequenceLength = numericSequence[0];
  const occupiedIndicesTracker = {};

  const checkParityMismatch = (val, idx) => {
    return ((val ^ idx) & 1) === 1;
  };

  for (let currentIdx = 1; currentIdx <= sequenceLength; currentIdx++) {
    const currentElementValue = numericSequence[currentIdx];

    if (checkParityMismatch(currentElementValue, currentIdx)) {
      return NO_RESULT_STR;
    }

    let currentUpperBoundary = currentElementValue;
    let currentLowerBoundary = currentIdx;

    while (currentIdx < currentUpperBoundary) {
      currentIdx++;
      const nextElementValueA = numericSequence[currentIdx];
      if (nextElementValueA !== currentIdx) {
        return NO_RESULT_STR;
      }

      currentIdx++;
      const nextElementValueB = numericSequence[currentIdx];
      if (checkParityMismatch(nextElementValueB, currentIdx)) {
        return NO_RESULT_STR;
      }

      if (currentUpperBoundary < nextElementValueB) {
        currentUpperBoundary = nextElementValueB;
        occupiedIndicesTracker[currentUpperBoundary] = 1;
      } else if (currentLowerBoundary === nextElementValueB) {
        const stepIncrement = 2;
        do {
          currentLowerBoundary += stepIncrement;
        } while (occupiedIndicesTracker[currentLowerBoundary]);
      } else {
        return NO_RESULT_STR;
      }
    }
  }

  return YES_RESULT_STR;
}
