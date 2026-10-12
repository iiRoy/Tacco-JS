'use strict';

function processInput(rawData) {
  const lines = rawData.trim().split('\n');

  const parseNumericString = (str) => Number(str);
  const configParams = lines[0].split(' ').map(parseNumericString);

  const contestants = lines[1].split('');

  const passStatus = [];

  let foreignContestantCounter = 0;

  const typeAPassThreshold = configParams[1] + configParams[2];

  for (let contestantIndex = 0; contestantIndex < contestants.length; contestantIndex++) {
    const currentContestantType = contestants[contestantIndex];
    const currentContestantRank = contestantIndex + 1;

    if (currentContestantType === 'a') {
      if (currentContestantRank < typeAPassThreshold) {
        passStatus[contestantIndex] = true;
      } else {
        passStatus[contestantIndex] = false;
      }
    } else if (currentContestantType === 'b') {
      const previousForeignerCount = foreignContestantCounter;
      if (currentContestantRank < previousForeignerCount) {
        passStatus[contestantIndex] = true;
      } else {
        passStatus[contestantIndex] = false;
      }
      foreignContestantCounter++;
    } else {
      passStatus[contestantIndex] = false;
    }
  }

  const outputPassResults = (resultsArray) => {
    for (let resultIndex = 0; resultIndex < resultsArray.length; resultIndex++) {
      if (resultsArray[resultIndex]) {
        console.log('Yes\n');
      } else {
        console.log('No\n');
      }
    }
  };

  outputPassResults(passStatus);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
