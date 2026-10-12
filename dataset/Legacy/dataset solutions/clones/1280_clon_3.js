var generateDeck = function() {
  var deckCollection = [];
  var cardSuits = ['S', 'H', 'C', 'D'];
  var cardRanks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const cardSeparator = ' ';
  
  cardSuits.forEach(function(currentSuit) {
    cardRanks.forEach(function(currentRank) {
      const rankString = currentRank.toString();
      deckCollection.push(currentSuit + cardSeparator + rankString);
    });
  });
  return deckCollection;
};

var readInputLines = function() {
  const fileSystemModule = require('fs');
  const inputFilePath = '/dev/stdin';
  const fileContent = fileSystemModule.readFileSync(inputFilePath, 'utf8');
  return fileContent.split('\n');
};

var printLine = function(outputValue) {
  console.log(outputValue);
  return outputValue;
};

var receivedCards = readInputLines();
var fullCardDeck = generateDeck();

var isCardMissing = function(cardToCheck) {
  const isPresentInInput = receivedCards.indexOf(cardToCheck) !== -1;
  return !isPresentInInput;
};

var missingCards = fullCardDeck.filter(isCardMissing);

missingCards.forEach(printLine);
