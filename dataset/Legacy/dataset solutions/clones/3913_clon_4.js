'use strict';

function main(inputString) {
  const [valA, valB, valK] = inputString.split('\n')[0].split(' ').map(Number);

  const iterationCount = Math.min(valK, valB - valA + 1);

  const generatedValues = Array.from({ length: iterationCount }, (_, currentIdx) => {
    const firstCandidate = valA + currentIdx;
    const secondCandidate = valB - currentIdx;
    return [firstCandidate, secondCandidate];
  }).flat();

  const uniqueSortedValues = Array.from(new Set(generatedValues)).sort((valX, valY) => valX - valY);

  console.log(uniqueSortedValues.join('\n'));
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
