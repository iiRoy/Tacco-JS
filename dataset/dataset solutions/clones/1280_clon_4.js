const fileSystemOps = require('fs');

const constructCardSet = () => {
    const suitDesignators = ['S', 'H', 'C', 'D'];
    const rankValues = '1 2 3 4 5 6 7 8 9 10 11 12 13'.split(' ');
    
    return suitDesignators.reduce((accumulatedCards, currentSuit) => {
        rankValues.forEach(currentRank => {
            accumulatedCards.push(`${currentSuit} ${currentRank}`);
        });
        return accumulatedCards;
    }, []);
};

const fetchInputData = () => {
    const rawData = fileSystemOps.readFileSync(0, 'utf8');
    return rawData.split('\n');
};

const emitOutput = (contentToDisplay) => {
    console.info(contentToDisplay);
};

const receivedEntries = new Set(fetchInputData());

constructCardSet().reduce((missingCardsBuffer, potentialCard) => {
    if (!receivedEntries.has(potentialCard)) {
        missingCardsBuffer.push(potentialCard);
    }
    return missingCardsBuffer;
}, []).forEach(emitOutput);