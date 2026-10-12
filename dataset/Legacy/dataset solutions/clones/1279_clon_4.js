'use strict';

const processInput = (sourceText) => {
    const rawLines = sourceText.trim().split('\n');
    const cardCount = parseInt(rawLines[0], 10);
    const presentCards = rawLines.slice(1, cardCount + 1);

    const suitIdentifiers = ['S', 'H', 'C', 'D'];
    const rankValues = Array.from({ length: 13 }, (_, index) => index + 1);

    const completeCardSet = suitIdentifiers.flatMap(currentSuit =>
        rankValues.map(currentRank => `${currentSuit} ${currentRank}`)
    );

    const providedCardRegistry = new Set(presentCards);

    const absentCardList = completeCardSet.filter(deckCard => !providedCardRegistry.has(deckCard));

    if (absentCardList.length > 0) {
        console.log(absentCardList.join('\n'));
    }
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
