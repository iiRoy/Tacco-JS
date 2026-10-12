function processGame() {
  let cardValues, uniqueCardsMap, tempVal;
  let inputIndex = 0;
  const NUM_CARDS_PER_HAND = 5;

  const readHand = (sourceInputArray, currentReadIndex) => {
    const handCards = [];
    for (let cardPosition = 0; cardPosition < NUM_CARDS_PER_HAND; cardPosition++) {
      handCards.push(Number(sourceInputArray[currentReadIndex++]));
    }
    return { handCards: handCards, nextInputIndex: currentReadIndex };
  };

  const generateUniqueCardMap = (cardsArray) => {
    const cardPresenceMap = {};
    for (const cardValue of cardsArray) {
      cardPresenceMap[cardValue] = true;
    }
    return cardPresenceMap;
  };

  const getSortedUniqueCardValues = (cardMapObject) => {
    return Object.keys(cardMapObject).map(Number).sort((valueA, valueB) => valueA - valueB);
  };

  while (true) {
    if (programInput[inputIndex] == 0) {
      break;
    }

    const handData = readHand(programInput, inputIndex);
    cardValues = handData.handCards;
    inputIndex = handData.nextInputIndex;

    uniqueCardsMap = generateUniqueCardMap(cardValues);

    const sortedUniqueCards = getSortedUniqueCardValues(uniqueCardsMap);

    if (sortedUniqueCards.length === 2) {
      if (sortedUniqueCards[1] - sortedUniqueCards[0] === 2) {
        tempVal = sortedUniqueCards[0];
        sortedUniqueCards[0] = sortedUniqueCards[1];
        sortedUniqueCards[1] = tempVal;
      }
      cardValues.forEach(function (currentCard) {
        const cardOutputIndex = sortedUniqueCards.indexOf(currentCard) + 1;
        console.log(cardOutputIndex);
      });
    } else {
      cardValues.forEach(function () {
        console.log(3);
      });
    }
  }
}

let programInput = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk) {
  programInput += dataChunk;
});
process.stdin.on('end', function() {
  programInput = programInput.split('\n');
  processGame();
});
