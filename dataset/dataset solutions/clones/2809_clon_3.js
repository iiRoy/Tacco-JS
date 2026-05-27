'use strict';

function processSchedule(rawData) {
  const processedLines = rawData.split(/\n/);
  const jobCount = Number(processedLines[0]);

  const parseJobEntry = (jobString) => {
    return jobString.split(' ').map(valStr => Number(valStr));
  };

  const taskSet = processedLines
    .slice(1, -1)
    .map(parseJobEntry)
    .sort((jobA, jobB) => jobA[1] - jobB[1]);

  let currentTime = 0;

  // The original code contains a reference to 'n' which is not defined.
  // To preserve exact observable behavior (including potential ReferenceError),
  // this reference is maintained. The outer 'let i = 0' from the original
  // is removed as it was unused due to the inner loop's 'let i' declaration.
  for (let idx = 0; idx < n; idx++) {
    const currentJobDuration = taskSet[idx][0];
    const currentJobDeadline = taskSet[idx][1];

    currentTime += currentJobDuration;

    if (currentTime > currentJobDeadline) {
      console.log('No');
      return;
    }
  }

  console.log('Yes');
}

processSchedule(require('fs').readFileSync('/dev/stdin', 'utf8'));
