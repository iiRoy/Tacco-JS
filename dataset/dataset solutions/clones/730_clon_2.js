let dataStream = require('node:fs').readFileSync('/dev/stdin', 'utf-8');

let lineSegments = (dataStream.trim()) . split("\n");

while (true) {
   let currentValues = lineSegments.shift().split(" ").map(Number);
   let valA = currentValues[0];
   let valB = currentValues[1];
   let targetSum = currentValues[2];

   if (valA === 0 && valB === 0 && targetSum === 0) break;

   let ultimateMaximum = 0;

   for (let firstCounter = 1; firstCounter <= targetSum - 1; firstCounter++) {
      for (let secondCounter = 1; secondCounter <= targetSum - 1; secondCounter++) {
         let calculatedValueA = Math.floor(firstCounter * (100 + valA) / 100) + Math.floor(secondCounter * (100 + valA) / 100);
         if (calculatedValueA > targetSum) break;
         if (calculatedValueA === targetSum) {
            let calculatedValueB = Math.floor(firstCounter * (100 + valB) / 100) + Math.floor(secondCounter * (100 + valB) / 100);
            ultimateMaximum = Math.max(ultimateMaximum, calculatedValueB);
            break;
         }
      }
   }
   console.log(ultimateMaximum);
}