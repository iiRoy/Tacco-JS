(function(rawInputContent) {
    const gameDecks = new Map(
        rawInputContent
            .trim()
            .split('\n')
            .slice(0, 3)
            .map((lineSegment, segmentIndex) => [
                ['a', 'b', 'c'][segmentIndex],
                lineSegment.split('').reverse()
            ])
    );

    function resolveGameOutcome(currentTurnHolder, availableDecks) {
        const currentDeckPile = availableDecks.get(currentTurnHolder);

        if (currentDeckPile.length === 0) {
            return currentTurnHolder;
        }

        const nextTurnHolder = currentDeckPile.pop();
        return resolveGameOutcome(nextTurnHolder, availableDecks);
    }

    const winningPlayer = resolveGameOutcome('a', gameDecks);

    console.log(winningPlayer.toUpperCase());

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
