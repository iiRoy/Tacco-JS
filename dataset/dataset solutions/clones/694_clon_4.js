const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLinesBuffer = rawInputData.trim().split('\n');
let currentLinePointer = 0;

while (true) {
   const currentDimensions = inputLinesBuffer[currentLinePointer++].split(' ').map(Number);
   const deckSize = currentDimensions[0];
   const operationCount = currentDimensions[1];

   if (deckSize === 0 && operationCount === 0) {
      break;
   }

   const cardCollection = Array.from({ length: deckSize }, (_, index) => deckSize - index);

   for (let opIndex = 0; opIndex < operationCount; opIndex++) {
      const operationParameters = inputLinesBuffer[currentLinePointer++].split(' ').map(Number);
      const startPosition = operationParameters[0] - 1; // Convert to 0-indexed
      const cardsToMove = operationParameters[1];

      const segmentToRelocate = cardCollection.splice(startPosition, cardsToMove);
      cardCollection.unshift(...segmentToRelocate);
   }
   console.log(cardCollection[0]);
}
