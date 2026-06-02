"use strict";

function mainExecution() {
  (function (inputContent) {
    const inputLines = inputContent.split("\n");

    const [maxStation, numTrains, numQueries] = inputLines[0].split(' ').map(Number);

    const trainData = inputLines.slice(1, numTrains + 1).map(line => {
      const parts = line.split(' ').map(Number);
      return { left: parts[0], right: parts[1] };
    });

    const queryData = inputLines.slice(numTrains + 1, numTrains + 1 + numQueries).map(line => {
      const parts = line.split(' ').map(Number);
      return { start: parts[0], end: parts[1] };
    });

    const trainFrequencies = Array.from({ length: maxStation + 1 }, () => Array(maxStation + 1).fill(0));

    for (const trn of trainData) {
      trainFrequencies[trn.right][trn.left]++;
    }

    const cumulativeTrainCounts = Array.from({ length: maxStation + 1 }, () => Array(maxStation + 1).fill(0));

    for (let currentR = 1; currentR <= maxStation; currentR++) {
      for (let currentL = 1; currentL <= maxStation; currentL++) {
        cumulativeTrainCounts[currentR][currentL] = cumulativeTrainCounts[currentR][currentL - 1] + trainFrequencies[currentR][currentL];
      }
    }

    for (const qry of queryData) {
      const queryStart = qry.start;
      const queryEnd = qry.end;

      const currentQueryResult = Array.from({ length: queryEnd - queryStart + 1 }, (_, idx) => queryStart + idx)
        .reduce((accumulator, currentR) => {
          return accumulator + (cumulativeTrainCounts[currentR][queryEnd] - cumulativeTrainCounts[currentR][queryStart - 1]);
        }, 0);

      console.log(currentQueryResult);
    }
  })(require("fs").readFileSync("/dev/stdin", "utf8"));
}

mainExecution();
