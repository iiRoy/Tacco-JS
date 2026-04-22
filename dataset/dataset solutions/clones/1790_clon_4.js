'use strict';
function evaluatePassage(sourceData) {
  const numericalComponents = sourceData.match(/\d+/g).map(numStr => parseInt(numStr, 10));

  const P1_INDEX = 0;
  const S1_INDEX = 1;
  const P2_INDEX = 2;
  const S2_INDEX = 3;
  const TM_INDEX = 4;

  const currentPosition1 = numericalComponents[P1_INDEX];
  const velocity1 = numericalComponents[S1_INDEX];
  const currentPosition2 = numericalComponents[P2_INDEX];
  const velocity2 = numericalComponents[S2_INDEX];
  const durationInterval = numericalComponents[TM_INDEX];

  const calculateFuturePosition = (start, rate, span) => start + rate * span;

  const finalLocation1 = calculateFuturePosition(currentPosition1, velocity1, durationInterval);
  const finalLocation2 = calculateFuturePosition(currentPosition2, velocity2, durationInterval);

  const outcomeMessage = (finalLocation1 > finalLocation2) ? 'YES' : 'NO';

  console.log(outcomeMessage);
}

evaluatePassage(require("node:fs").readFileSync(process.stdin.fd, "utf8"));