var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var processedLines = fileContent.trim().split("\n");
processedLines.shift();
processedLines.sort((valA, valB) => Number(valA) - Number(valB));
var generatedCombinations = [];
const combinationLimit = 5;
for (let firstIndex = 0; firstIndex < combinationLimit; firstIndex++) {
   for (let secondIndex = firstIndex + 1; secondIndex < combinationLimit; secondIndex++) {
      let elementA = processedLines[firstIndex];
      let elementB = processedLines[secondIndex];
      generatedCombinations.push(Number(elementA + elementB));
      generatedCombinations.push(Number(elementB + elementA));
   }
}
generatedCombinations.sort((numA, numB) => numA - numB);
console.log(generatedCombinations[2]);
