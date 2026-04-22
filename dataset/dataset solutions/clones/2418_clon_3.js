// Helper for managing I/O operations through readline interface
const inputManager = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

const QUERY_INDICATOR = "? ";
const RESULT_INDICATOR = "! ";
const COLOR_RED = "R";
const COLOR_BLUE = "B";

const interactiveProblemSolver = (function* () {
  const obtainInputLine = () => {
    inputManager.once("line", inputString => {
      interactiveProblemSolver.next(inputString);
    });
    return undefined;
  };

  let problemSize = parseInt(yield obtainInputLine(), 10);

  if (isNaN(problemSize) || problemSize <= 0) {
    console.error("Error: Invalid problem size received. Exiting.");
    inputManager.close();
    return;
  }

  const initialQueryArray = Array.from({
    length: problemSize
  }, (_, index) => index + 1);

  console.log(QUERY_INDICATOR + initialQueryArray.join(" "));

  const firstFeedback = yield obtainInputLine();

  let pivotIndex = 1;

  while (true) {
    const currentTestArray = [...initialQueryArray];
    currentTestArray[pivotIndex - 1] = pivotIndex + problemSize;

    console.log(QUERY_INDICATOR + currentTestArray.join(" "));

    const currentFeedback = yield obtainInputLine();

    if (firstFeedback[0] !== currentFeedback[0]) {
      break;
    }

    pivotIndex++;

    if (pivotIndex > problemSize * 2) {
      console.warn("Warning: Pivot index exceeded expected range. Breaking loop.");
      break;
    }
  }

  const finalSolutionSequence = new Array(2 * problemSize);

  const patternA = new Array(problemSize - 1);
  const patternB = new Array(problemSize - 1);

  const valuesIncludedInPatternA = new Set();

  for (let queryIdx = 0; queryIdx < problemSize - 1; queryIdx++) {
    const valA = pivotIndex + queryIdx;
    patternA[queryIdx] = valA;
    patternB[queryIdx] = (valA + problemSize) % (2 * problemSize);
    if (patternB[queryIdx] === 0) patternB[queryIdx] = 2 * problemSize;
    valuesIncludedInPatternA.add(valA);
  }

  const totalPossibleValues = 2 * problemSize;
  for (let currentVal = 1; currentVal <= totalPossibleValues; currentVal++) {
    let activeQueryPattern = [];
    let finalElementToAppend;

    const isValueInPatternA = valuesIncludedInPatternA.has(currentVal);

    if (isValueInPatternA) {
      activeQueryPattern = [...patternB];
      finalElementToAppend = currentVal;
    } else {
      activeQueryPattern = [...patternA];
      finalElementToAppend = currentVal;
    }

    activeQueryPattern.push(finalElementToAppend);

    console.log(QUERY_INDICATOR + activeQueryPattern.join(" "));

    const probeResponse = yield obtainInputLine();

    finalSolutionSequence[currentVal - 1] = (probeResponse[0] === COLOR_RED) ? COLOR_RED : COLOR_BLUE;
  }

  console.log(RESULT_INDICATOR + finalSolutionSequence.join(""));

  inputManager.close();

})();

interactiveProblemSolver.next();