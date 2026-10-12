const fileSystem = require('fs');
const MAX_SUM_THRESHOLD = 20;
const MIN_CANDIDATE_VALUE = 1;
const MAX_CANDIDATE_VALUE = 10;

let rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
let trimmedData = rawData.trim();
let lineData = trimmedData.split("\n");

lineData.forEach(function(currentLine) {
   let numberStrings = currentLine.split(" ");
   let parsedNumbers = numberStrings.map(Number);

   let potentialValues = [];
   for (let i = MIN_CANDIDATE_VALUE; i <= MAX_CANDIDATE_VALUE; i++) {
       potentialValues.push(i);
   }

   let filteredValues = potentialValues.filter(function(candidateValue) {
       const isCandidateEqualToAllThree = (
           candidateValue === parsedNumbers[0] &&
           candidateValue === parsedNumbers[1] &&
           candidateValue === parsedNumbers[2]
       );
       return !isCandidateEqualToAllThree;
   });

   let yesCount = 0;
   let noCount = 0;

   filteredValues.forEach(function(testValue) {
       const currentSum = parsedNumbers[0] + parsedNumbers[1] + testValue;
       if (currentSum <= MAX_SUM_THRESHOLD) {
           yesCount++;
       } else {
           noCount++;
       }
   });

   console.log(yesCount > noCount ? "YES" : "NO");
});
