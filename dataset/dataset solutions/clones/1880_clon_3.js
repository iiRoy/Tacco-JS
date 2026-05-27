function processInput(rawData) {
  const firstLineParts = rawData[0].trim().split(" ");
  const nodeCount = BigInt(firstLineParts[0]);
  const totalSteps = BigInt(firstLineParts[1]);

  const secondLineParts = rawData[1].trim().split(" ");
  const jumpMap = secondLineParts.map(val => parseInt(val, 10) - 1);

  const visitTracker = new Array(Number(nodeCount)).fill(-1);

  let stepCounter = 0;
  let currentPos = 0;
  let cycleDetected = false;

  while (true) {
    const nextJumpTarget = jumpMap[currentPos];
    if (visitTracker[nextJumpTarget] === -1) {
      visitTracker[nextJumpTarget] = stepCounter;
      stepCounter++;
      currentPos = nextJumpTarget;
    } else {
      cycleDetected = true;
      currentPos = nextJumpTarget;
      break;
    }
  }

  const preCycleSteps = BigInt(visitTracker[currentPos]);
  const cycleLength = BigInt(stepCounter - visitTracker[currentPos]);

  let effectiveSteps = 0n;

  const stepsBeforeLoopEntry = totalSteps - preCycleSteps;
  const isBeforeLoop = stepsBeforeLoopEntry < 0n;

  if (isBeforeLoop || !cycleDetected) {
    effectiveSteps = totalSteps;
  } else {
    const stepsWithinLoop = stepsBeforeLoopEntry % cycleLength;
    effectiveSteps = stepsWithinLoop + preCycleSteps;
  }

  let finalPosition = 0;
  for (let stepIdx = 0n; stepIdx < effectiveSteps; stepIdx++) {
    finalPosition = jumpMap[finalPosition];
  }

  console.log(String(finalPosition + 1));
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = fileContent.trim().split("\n");
processInput(lines);
