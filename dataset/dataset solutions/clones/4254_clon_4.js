'use strict';

(function() {
  const sourceText = require("fs").readFileSync("/dev/stdin", "utf8");
  const numericalValue = Number(sourceText);

  function locateSquareRootInteger(targetBound, currentAttempt = 0) {
    if (currentAttempt * currentAttempt >= targetBound) {
      return currentAttempt;
    }
    return locateSquareRootInteger(targetBound, currentAttempt + 1);
  }

  let computedOutcome;
  if (numericalValue <= 0) {
    computedOutcome = 1;
  } else {
    const discoveredRoot = locateSquareRootInteger(numericalValue);
    computedOutcome = (discoveredRoot - 1) * (discoveredRoot - 1);
  }

  console.log(computedOutcome);
})();