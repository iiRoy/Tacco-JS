function generateSequences(inputCount) {
   var collectedPermutations = [];
   var currentSelection = [];

   var recursiveGenerator = function(sourceElements) {
      var loopCounter, extractedItem;
      for (loopCounter = 0; loopCounter < sourceElements.length; loopCounter++) {
         extractedItem = sourceElements.splice(loopCounter, 1)[0];
         currentSelection.push(extractedItem);
         if (sourceElements.length == 0) {
            collectedPermutations.push(currentSelection.slice());
         }
         recursiveGenerator(sourceElements);
         sourceElements.splice(loopCounter, 0, extractedItem);
         currentSelection.pop();
      }
      return collectedPermutations;
   };

   var initialNumbers = [];
   for (var elementIndex = 0; elementIndex < inputCount; elementIndex++) {
      initialNumbers.push(elementIndex);
   }
   return recursiveGenerator(initialNumbers);
}

var fileContents = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = fileContents.trim().split("\n");
while (true) {
   var currentBatchSize = inputLines.shift() - 0;
   if (currentBatchSize == 0) break;
   var batchData = [];
   for (var itemIterator = 0; itemIterator < currentBatchSize; itemIterator++) {
      batchData[itemIterator] = inputLines.shift().split(" ");
   }
   batchData = batchData.map(dataItem => [dataItem[0], dataItem[1] - 0, dataItem[2] - 0]);
   var allArrangements = generateSequences(currentBatchSize);
   var highestScore = 0;
   var bestOrder = "";
   allArrangements.forEach(currentPermutation => {
      var isValidSequence = true;
      var totalDuration = 0;
      var weightedCompletionTime = 0;
      currentPermutation.forEach((originalTaskIndex, positionInSequence) => {
         if (totalDuration > batchData[originalTaskIndex][2]) isValidSequence = false;
         totalDuration += batchData[originalTaskIndex][1];
         weightedCompletionTime += batchData[originalTaskIndex][1] * (positionInSequence + 1);
      });
      if (isValidSequence && weightedCompletionTime / totalDuration > highestScore) {
         highestScore = weightedCompletionTime / totalDuration;
         bestOrder = currentPermutation;
      }
   });
   console.log(bestOrder.map(sequenceIndex => batchData[sequenceIndex][0]).reverse().join("\n"));
}