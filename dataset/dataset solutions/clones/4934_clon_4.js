'use strict';

function processContest(sourceText) {
  const lineSegments = sourceText.trim().split('\n');
  const configParams = lineSegments[0].split(' ').map(Number);
  const contestantEntries = lineSegments[1].split('');

  // Pre-calculate the cumulative count of 'b' entries encountered up to the previous index.
  // This replaces the nested loop used in the original code to determine 'foreigner' for each 'b' challenger.
  const priorBCounts = contestantEntries.reduce((accumulator, currentEntry, currentIndex) => {
    if (currentIndex === 0) {
      accumulator.push(0); // No 'b' entries before the very first element.
    } else {
      // The count of 'b's before the current index is the count before the previous index
      // plus one if the entry at the previous index was 'b'.
      const countBeforeCurrent = accumulator[currentIndex - 1] + (contestantEntries[currentIndex - 1] === 'b' ? 1 : 0);
      accumulator.push(countBeforeCurrent);
    }
    return accumulator;
  }, []);

  // Determine the pass/fail status for each contestant entry using a functional map.
  // This replaces the main imperative loop from the original implementation.
  const outcomeFlags = contestantEntries.map((entryChar, entryIndex) => {
    if (entryChar === 'a') {
      // For 'a' type challengers, the condition is (1-based index) < (a[1] + a[2]).
      return entryIndex + 1 < configParams[1] + configParams[2];
    } else if (entryChar === 'b') {
      // For 'b' type challengers, the condition is (1-based index) < (count of 'b's before current index).
      // We retrieve this pre-calculated count from the 'priorBCounts' array.
      const countOfPreviousBs = priorBCounts[entryIndex];
      return entryIndex + 1 < countOfPreviousBs;
    } else {
      // Any other character type automatically results in a fail.
      return false;
    }
  });

  // Transform the boolean pass/fail flags into the required output strings.
  // The original `console.log('Yes\n')` prints "Yes" followed by two newline characters.
  // We replicate this by appending an extra newline to each result string.
  const outputLines = outcomeFlags.map(passed =>
    passed ? 'Yes\n\n' : 'No\n\n'
  );

  // Concatenate all output strings and write them to standard output in a single operation.
  // This replaces the loop-based `console.log` calls from the original.
  process.stdout.write(outputLines.join(''));
}

// The entry point function, maintaining the original's external contract.
function main(input) {
  processContest(input);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
