function processCardData(inputCardStrings) {
  const cardPresenceMap = {};
  const suitIdentifiers = ['S', 'H', 'C', 'D'];
  const minRankValue = 1;
  const maxRankValue = 13;

  for (let suitIndex = 0; suitIndex < suitIdentifiers.length; suitIndex++) {
    const currentSuit = suitIdentifiers[suitIndex];
    for (let rankValue = minRankValue; rankValue <= maxRankValue; rankValue++) {
      const cardKey = currentSuit + ' ' + rankValue;
      cardPresenceMap[cardKey] = true;
    }
  }

  inputCardStrings.slice(1).forEach(function(receivedCardString) {
    if (receivedCardString) {
      cardPresenceMap[receivedCardString] = false;
    }
  });

  Object.keys(cardPresenceMap).forEach(function(currentCardKey) {
    const isCardMissing = cardPresenceMap[currentCardKey];
    if (isCardMissing) {
      console.log(currentCardKey);
    }
  });
}

const inputDataChunks = [];
process.stdin.on('data', function(dataChunk) {
  inputDataChunks.push(dataChunk);
});

process.stdin.on('end', function() {
  const allInputContent = inputDataChunks.join('');
  const processedLines = allInputContent.split('\n');
  processCardData(processedLines);
});
