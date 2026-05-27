"use strict";

function analyzeStrings(rawInputData) {
  const inputLines = rawInputData.split('\n');
  const initialLineCount = parseInt(inputLines.shift());

  let totalABOccurrences = 0;
  let stringsEndingWithA = 0;
  let stringsStartingWithB = 0;
  let hasStringStartingBAndEndingA = false;

  inputLines.forEach(currentString => {
    const stringWithoutAB = currentString.replace(/AB/g, '');
    const currentStringABCount = (currentString.length - stringWithoutAB.length) / 2;
    totalABOccurrences += currentStringABCount;

    console.log(`count: ${totalABOccurrences}`);

    const startsWithB = currentString.charAt(0) === 'B';
    if (startsWithB) {
      stringsStartingWithB++;
    }

    const endsWithA = currentString.charAt(currentString.length - 1) === 'A';
    if (endsWithA) {
      stringsEndingWithA++;
    }

    if (startsWithB && endsWithA) {
      hasStringStartingBAndEndingA = true;
    }
  });

  const minEndsStarts = Math.min(stringsEndingWithA, stringsStartingWithB);
  totalABOccurrences += minEndsStarts;

  if (hasStringStartingBAndEndingA) {
    totalABOccurrences--;
  }

  console.log(totalABOccurrences);
}

analyzeStrings(require("fs").readFileSync("/dev/stdin", "utf8"));
