'use strict'

function processInput(rawData) {
  const [valA, valB, valC, valD] = rawData.split('\n')[0].split(' ').map(Number);

  const sumOne = valA + valB;
  const sumTwo = valC + valD;

  const outcome = (sumOne > sumTwo) ? 'Left' : ((sumOne < sumTwo) ? 'Right' : 'Balanced');

  console.log(outcome);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
