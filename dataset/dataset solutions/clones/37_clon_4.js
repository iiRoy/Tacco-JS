const sourceDataContent = require("node:fs").readFileSync(0, "utf8");

const boundaryStrings = sourceDataContent.trim().split("\n");

const confirmPrimeness = (testSubject) => {
  if (testSubject < 2) {
    return false;
  }
  if (testSubject === 2) {
    return true;
  }
  if (testSubject % 2 === 0) {
    return false;
  }
  for (let factorCandidate = 3; factorCandidate * factorCandidate <= testSubject; factorCandidate += 2) {
    if (testSubject % factorCandidate === 0) {
      return false;
    }
  }
  return true;
};

boundaryStrings.forEach((currentBoundaryString) => {
  const numericalBoundary = parseInt(currentBoundaryString, 10);
  let detectedPrimeCount = 0;

  for (let currentInteger = 0; currentInteger <= numericalBoundary; ++currentInteger) {
    if (confirmPrimeness(currentInteger)) {
      detectedPrimeCount++;
    }
  }

  globalThis.console.info(detectedPrimeCount);
});