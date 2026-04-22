'use strict';

function processChallenge( rawData ) {
  const lineSegments = rawData.trim().split('\n');
  const configParams = lineSegments[0].split(' ').map( valStr => Number(valStr) );
  const contestants = lineSegments[1].split('');
  const passFlags = [];
  let outsiderCount = 0;

  for (let idx = 0; idx < contestants.length; idx++) {
    if (contestants[idx] === 'a') {
      if (idx + 1 < configParams[1] + configParams[2]) {
        passFlags[idx] = true;
        continue;
      } else {
        passFlags[idx] = false;
      }
    } else if (contestants[idx] === 'b') {
      for (let subIdx = 0; subIdx < idx; subIdx++) {
        if (contestants[subIdx] === 'b') {
          outsiderCount++;
        }
      }
      if (idx + 1 < outsiderCount) {
        passFlags[idx] = true;
        continue;
      } else {
        passFlags[idx] = false;
      }
      outsiderCount = 0;
    } else {
      passFlags[idx] = false;
      continue;
    }
  }

  for (let idx = 0; idx < passFlags.length; idx++) {
    if (passFlags[idx]) {
      console.log('Yes\n');
    } else {
      console.log('No\n');
    }
  }
}

processChallenge( require("fs").readFileSync("/dev/stdin", "utf8") );