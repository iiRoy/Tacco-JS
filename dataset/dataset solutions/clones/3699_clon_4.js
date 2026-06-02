'use strict';

function ProcessData(rawData) {
  const contentLines = rawData.split('\n');
  // The first line, which might represent 'N', is not utilized in the original logic,
  // so we proceed directly to process the second line.
  const numericalSequence = contentLines[1].split(' ').map(Number);

  // Employ a single 'reduce' operation to determine both the minimum and maximum
  // values within the numerical sequence. This diverges from the original's
  // use of separate Math.min.apply and Math.max.apply calls.
  const rangeExtremes = numericalSequence.reduce((accumulator, currentVal) => {
    // The first element of the accumulator stores the current minimum.
    accumulator[0] = Math.min(accumulator[0], currentVal);
    // The second element of the accumulator stores the current maximum.
    accumulator[1] = Math.max(accumulator[1], currentVal);
    return accumulator;
  }, [Infinity, -Infinity]); // Initialize with values that guarantee the first element will set the initial min/max.

  const highestValue = rangeExtremes[1];
  const lowestValue = rangeExtremes[0];

  console.log(highestValue - lowestValue);
}

ProcessData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
