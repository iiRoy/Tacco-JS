((inputString) => {
    const allLines = inputString.trim().split('\n').filter(Boolean);
    const pointQuantity = Number(allLines[0]);

    const allCoords = allLines.slice(1).map(s => s.split(' ').map(Number));

    const redSet = allCoords.slice(0, pointQuantity);
    const blueSet = allCoords.slice(pointQuantity, 2 * pointQuantity);

    const coordinateComparator = (alpha, beta) => Math.min(alpha[0], alpha[1]) - Math.min(beta[0], beta[1]);

    redSet.sort(coordinateComparator);
    blueSet.sort(coordinateComparator);

    const initialMatchState = {
        currentMatches: 0,
        nextBluePosition: 0
    };

    const finalMatchResult = redSet.reduce((pairAccumulator, currentRedPt) => {
        const availableBlueSublist = blueSet.slice(pairAccumulator.nextBluePosition);

        const relativeIndex = availableBlueSublist.findIndex(potentialBluePt =>
            currentRedPt[0] < potentialBluePt[0] && currentRedPt[1] < potentialBluePt[1]
        );

        if (relativeIndex !== -1) {
            return {
                currentMatches: pairAccumulator.currentMatches + 1,
                nextBluePosition: pairAccumulator.nextBluePosition + relativeIndex + 1
            };
        } else {
            return pairAccumulator;
        }
    }, initialMatchState);

    return `${finalMatchResult.currentMatches}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8'));