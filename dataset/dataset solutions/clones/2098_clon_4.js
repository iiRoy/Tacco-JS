function ProcessInputAndCompute(rawInput) {
  const parts = rawInput.trim().split(' ');
  const initialResource = Number(parts[0]);
  const workDuration = Number(parts[1]);
  const restDuration = Number(parts[2]);

  let accumulatedWork = 0;
  let currentResource = initialResource;
  const fullCycleLength = workDuration + restDuration;

  while (currentResource >= fullCycleLength) {
    accumulatedWork += workDuration;
    currentResource -= fullCycleLength;
  }

  let finalSegmentContribution;
  if (workDuration < currentResource) {
    finalSegmentContribution = workDuration;
  } else {
    finalSegmentContribution = currentResource;
  }

  return accumulatedWork + finalSegmentContribution;
}

function EntryPoint(inputString) {
  'use strict';
  const computedValue = ProcessInputAndCompute(inputString);
  console.log(computedValue);
}

EntryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
