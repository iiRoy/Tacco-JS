function processSequence(inputData) {
  const [countNodesStr, targetStepsStr] = inputData[0].trim().split(" ");
  const countNodes = BigInt(countNodesStr);
  const targetSteps = BigInt(targetStepsStr);

  const nextIndices = inputData[1].trim().split(" ").map(val => parseInt(val) - 1);

  const pathSequence = [];
  const visitedStepMap = new Map();

  let currentPosition = 0;
  let currentStep = 0;
  let cycleEntryStep = -1;
  let cycleLengthVal = -1;

  while (true) {
    if (visitedStepMap.has(currentPosition)) {
      cycleEntryStep = visitedStepMap.get(currentPosition);
      cycleLengthVal = currentStep - cycleEntryStep;
      break;
    }

    visitedStepMap.set(currentPosition, currentStep);
    pathSequence.push(currentPosition);

    currentPosition = nextIndices[currentPosition];
    currentStep++;
  }

  let finalEffectiveStep;

  if (targetSteps < BigInt(cycleEntryStep)) {
    finalEffectiveStep = targetSteps;
  } else {
    const stepsBeyondCycleEntry = targetSteps - BigInt(cycleEntryStep);
    const effectiveStepsWithinCycle = stepsBeyondCycleEntry % BigInt(cycleLengthVal);
    finalEffectiveStep = BigInt(cycleEntryStep) + effectiveStepsWithinCycle;
  }

  const finalNode = pathSequence[Number(finalEffectiveStep)];

  console.log((finalNode + 1) + "");
}

processSequence(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
