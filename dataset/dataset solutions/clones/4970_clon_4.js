((sourceText) => {
    const playerIndexMap = { 'a': 0, 'b': 1, 'c': 2 };
    const playerCardDecks = Array.from({ length: 3 }, () => []);

    const rawSegments = sourceText.trim().split('\n');

    for (let currentLineIndex = 0; currentLineIndex < rawSegments.length && currentLineIndex < 3; currentLineIndex++) {
        playerCardDecks[currentLineIndex] = rawSegments[currentLineIndex].split('');
    }

    let currentTurnHolder = 'a';

    for (;;) {
        const currentHolderIndex = playerIndexMap[currentTurnHolder];
        const holderDeck = playerCardDecks[currentHolderIndex];

        if (holderDeck.length === 0) {
            break;
        }

        const nextHolderSymbol = holderDeck.shift();
        currentTurnHolder = nextHolderSymbol;
    }

    console.log(currentTurnHolder.toUpperCase());

})(require('fs').readFileSync('/dev/stdin', 'utf8'));