var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineBuffer = rawData.trim().split("\n");

while (true) {
   var currentInputLine = lineBuffer.shift();
   var parsedNumericParameters = currentInputLine.split(" ").map(Number);
   
   var numberOfCards = parsedNumericParameters[0];
   var numberOfCutOperations = parsedNumericParameters[1];
   
   if (numberOfCards === 0 && numberOfCutOperations === 0) {
      break;
   }
   
   var cardDeck = [];
   for (var cardIndex = 0; cardIndex < numberOfCards; cardIndex++) {
      cardDeck.push(numberOfCards - cardIndex);
   }
   
   for (var operationIteration = 0; operationIteration < numberOfCutOperations; operationIteration++) {
      var cutDetailsLine = lineBuffer.shift();
      var cutParameters = cutDetailsLine.split(" ").map(Number);
      
      var cutStartingPositionZeroBased = cutParameters[0] - 1;
      var cutLength = cutParameters[1];
      
      var segmentBeforeCut = cardDeck.slice(0, cutStartingPositionZeroBased);
      var segmentToMove = cardDeck.slice(cutStartingPositionZeroBased, cutStartingPositionZeroBased + cutLength);
      var segmentAfterCut = cardDeck.slice(cutStartingPositionZeroBased + cutLength);
      
      cardDeck = [...segmentToMove, ...segmentBeforeCut, ...segmentAfterCut];
   }
   console.log(cardDeck[0]);
}
