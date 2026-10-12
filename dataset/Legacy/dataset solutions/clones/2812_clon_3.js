'use strict';

const NEWLINE_SEPARATOR = '\n';
const SUCCESS_INDICATOR = 'Yes';
const FAILURE_INDICATOR = 'No';

function parseTaskDetails(lineString) {
  const components = lineString.split(' ');
  const durationValue = parseInt(components[0]);
  const deadlineValue = parseInt(components[1]);
  return [durationValue, deadlineValue];
}

function processInput(rawData) {
  const inputLines = rawData.split(NEWLINE_SEPARATOR);

  const firstLine = inputLines.shift();
  const taskCount = parseInt(firstLine);

  const jobList = [];
  for (let idx = 0; idx < taskCount; idx++) {
    const currentLine = inputLines.shift();
    const taskDetails = parseTaskDetails(currentLine);
    jobList.push(taskDetails);
  }

  jobList.sort((taskA, taskB) => taskA[1] - taskB[1]);

  let finalOutcome;
  let currentTime = 0;
  let isFeasible = true;

  for (let idx = 0; idx < taskCount; idx++) {
    const currentJob = jobList[idx];
    const jobDuration = currentJob[0];
    const jobDeadline = currentJob[1];

    currentTime += jobDuration;

    if (currentTime > jobDeadline) {
      isFeasible = false;
      break;
    }
  }

  finalOutcome = isFeasible ? SUCCESS_INDICATOR : FAILURE_INDICATOR;

  console.log(finalOutcome);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
