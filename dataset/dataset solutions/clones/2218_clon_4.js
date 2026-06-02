'use strict';

const processInput = rawData => {
  const elementCount = parseInt(rawData[0], 10);
  const numericSequence = rawData[1].split(' ').map(Number);

  const tallyResult = numericSequence.reduce((accumulator, currentElement) => {
    if (currentElement <= accumulator.minimumEncountered) {
      return {
        countOfQualifiers: accumulator.countOfQualifiers + 1,
        minimumEncountered: currentElement,
      };
    } else {
      return {
        countOfQualifiers: accumulator.countOfQualifiers,
        minimumEncountered: accumulator.minimumEncountered,
      };
    }
  }, { countOfQualifiers: 0, minimumEncountered: Infinity });

  console.log(tallyResult.countOfQualifiers);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
