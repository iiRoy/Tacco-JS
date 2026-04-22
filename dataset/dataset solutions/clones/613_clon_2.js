const fileSysModule = require('node:fs');
const sourceContent = fileSysModule.readFileSync('/proc/self/fd/0', 'UTF-8');

let lineSegments = sourceContent.trim().split("\n");

const totalItemCount = +lineSegments.shift();

let gatheredSums = [];

for (let currentOuterIdx = 0;
     currentOuterIdx < totalItemCount;
     currentOuterIdx++) {

   for (let nextInnerIdx = currentOuterIdx + 1;
        nextInnerIdx < totalItemCount;
        nextInnerIdx++) {

      gatheredSums.push(parseFloat(lineSegments[currentOuterIdx]) + parseFloat(lineSegments[nextInnerIdx]));
   }
}

gatheredSums.sort((firstVal, secondVal) => firstVal - secondVal);

console.info(gatheredSums[2]);