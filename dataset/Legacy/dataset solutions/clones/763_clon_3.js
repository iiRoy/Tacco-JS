var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineBuffer = rawData.trim().split("\n");

while (true) {
   var elementCount = parseInt(lineBuffer.shift(), 10);
   if (elementCount === 0) {
       break;
   }

   var currentElements = lineBuffer.shift().split(" ");
   var winnerFound = false;
   var frequencyMap = {};

   for (var currentIndex = 0; currentIndex < elementCount; currentIndex++) {
      var currentElementValue = currentElements[currentIndex];
      frequencyMap[currentElementValue] = (frequencyMap[currentElementValue] || 0) + 1;

      var sortedFrequencies = Object.entries(frequencyMap).map(([key, value]) => [value, key]);
      sortedFrequencies.sort(function(a, b) {
         return a[0] - b[0];
      });

      var processedCount = currentIndex + 1;
      var remainingItems = elementCount - processedCount;

      var minFrequency = sortedFrequencies[0][0];
      var secondMinFrequency;

      if (sortedFrequencies.length < 2) {
          secondMinFrequency = 0;
      } else {
          secondMinFrequency = sortedFrequencies[1][0];
      }

      if (minFrequency === secondMinFrequency) {
         continue;
      }

      if (minFrequency > secondMinFrequency + remainingItems) {
         var winningElement = sortedFrequencies[0][1];
         console.log(winningElement + " " + processedCount);
         winnerFound = true;
         break;
      }
   }

   if (!winnerFound) {
       console.log("TIE");
   }
}
