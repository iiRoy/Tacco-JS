const processCardGame = (gameInputData) => {
    const dataLines = gameInputData.split('\n');
    const rawCardStrings = dataLines[1].split(' ');

    const numericalCards = rawCardStrings.map(Number).sort((valA, valB) => valB - valA);

    const scoreDifference = numericalCards.reduce((currentDelta, cardValue, indexPosition) => {
        return indexPosition % 2 === 0
            ? currentDelta + cardValue
            : currentDelta - cardValue;
    }, 0);

    console.log(scoreDifference);
};

processCardGame(require('fs').readFileSync('/dev/stdin', 'utf8'));
