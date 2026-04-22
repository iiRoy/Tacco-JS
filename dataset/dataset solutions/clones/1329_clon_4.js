let retainedBuffer = [];

process.stdin.on('data', (incomingSegment) => {
    retainedBuffer.push(incomingSegment);
});

process.stdin.on('end', () => {
    const completeContent = retainedBuffer.join('');
    const allLines = completeContent.split('\n');

    const totalChallenges = parseInt(allLines[0], 10);
    const challengeEntries = allLines.slice(1, totalChallenges + 1);

    const pointAllocationMatrix = {
        '10': { scoreOne: 0, scoreTwo: 3 },
        '01': { scoreOne: 1, scoreTwo: 1 },
        '00': { scoreOne: 3, scoreTwo: 0 }
    };

    const finalAccumulation = challengeEntries.reduce((scoreBag, currentChallengeText) => {
        const parts = currentChallengeText.split(' ');
        const entityAValue = parts[0];
        const entityBValue = parts[1];

        const isALessThanB = (entityAValue < entityBValue);
        const isAEqualToB = (entityAValue === entityBValue);

        const outcomeKey = `${+isALessThanB}${+isAEqualToB}`;

        const currentRoundPoints = pointAllocationMatrix[outcomeKey];

        return {
            playerOneTotal: scoreBag.playerOneTotal + currentRoundPoints.scoreOne,
            playerTwoTotal: scoreBag.playerTwoTotal + currentRoundPoints.scoreTwo
        };
    }, { playerOneTotal: 0, playerTwoTotal: 0 });

    console.log(finalAccumulation.playerOneTotal, finalAccumulation.playerTwoTotal);
});

process.stdin.resume();
process.stdin.setEncoding('utf-8');