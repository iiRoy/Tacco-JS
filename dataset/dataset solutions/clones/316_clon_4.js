const obtainGameInput = () => {
    const comprehensiveRawData = process.stdin.readFileSync(0, 'utf8');
    const segmentedLines = comprehensiveRawData.trim().split('\n');

    const setupLine = segmentedLines.shift();
    const [participantCount] = setupLine.split(' ').map(Number);

    const initialScoreboard = Array.from({ length: participantCount }, () => 0);

    const initialLeadingPlayer = {
        identity: 0,
        score: 0
    };

    return {
        initialGameState: {
            currentScores: initialScoreboard,
            leadingPlayerIdentity: initialLeadingPlayer.identity,
            leadingPlayerScore: initialLeadingPlayer.score
        },
        actionRecords: segmentedLines
    };
};

const identifyLeadingCompetitor = (currentScoreboard) => {
    let peakScore = -Infinity;
    let peakIdentity = -1;

    for (let playerIndex = 0; playerIndex < currentScoreboard.length; playerIndex++) {
        const individualPoints = currentScoreboard[playerIndex];
        if (individualPoints > peakScore) {
            peakScore = individualPoints;
            peakIdentity = playerIndex;
        }
    }
    return {
        identity: peakIdentity,
        score: peakScore
    };
};

const processSingleAction = (previousGameState, currentActionRecord) => {
    const actionDetails = currentActionRecord.split(' ').map(Number);
    const affectedPlayerIndex = actionDetails[0] - 1;
    const pointsDelta = actionDetails[1];

    const updatedScores = [...previousGameState.currentScores];
    updatedScores[affectedPlayerIndex] += pointsDelta;

    const { identity: newLeadingIdentity, score: newLeadingScore } = identifyLeadingCompetitor(updatedScores);

    console.log(`${newLeadingIdentity + 1} ${newLeadingScore}`);

    return {
        currentScores: updatedScores,
        leadingPlayerIdentity: newLeadingIdentity,
        leadingPlayerScore: newLeadingScore
    };
};

const gameContext = obtainGameInput();

gameContext.actionRecords.reduce(processSingleAction, gameContext.initialGameState);