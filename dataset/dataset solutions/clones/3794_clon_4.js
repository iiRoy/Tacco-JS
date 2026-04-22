function analyzeObstacles(rawText) {
    const lines = rawText.split('\n');
    const totalCount = Number(lines[0]);
    const elementStream = lines[1];

    const fullStreamEast = [...elementStream].filter(symbol => symbol === 'E').length;

    const finalState = [...elementStream].reduce((state, currentSymbol) => {
        const rightEastForCurrentSplit = fullStreamEast - state.leftEast;
        const currentSplitObstruction = state.leftWest + rightEastForCurrentSplit;

        const updatedMinObs = Math.min(state.minObs, currentSplitObstruction);

        let nextLeftEast = state.leftEast;
        let nextLeftWest = state.leftWest;

        if (currentSymbol === 'E') {
            nextLeftEast++;
        } else {
            nextLeftWest++;
        }

        return {
            leftEast: nextLeftEast,
            leftWest: nextLeftWest,
            minObs: updatedMinObs
        };
    }, {
        leftEast: 0,
        leftWest: 0,
        minObs: fullStreamEast
    });

    const finalSplitPointObstruction = finalState.leftWest;

    return Math.min(finalState.minObs, finalSplitPointObstruction);
}

console.log(analyzeObstacles(require('fs').readFileSync('/dev/stdin', 'utf8')));