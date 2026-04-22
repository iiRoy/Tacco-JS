const emitOutcome = (dataValue) => console.log(dataValue);

function* provideChronicle(sourceMaterial) {
    const segments = sourceMaterial.split('\n');
    let currentPosition = 0;
    while (currentPosition < segments.length) {
        yield segments[currentPosition++];
    }
}

function conductOffensivePhase(currentSituationalData, eventIterator) {
    let { pointsAccumulated: currentScoreboard, activeParticipant: currentSquad, runnersPresent: baseOccupancy } = currentSituationalData;
    let dismissalsCount = 0;

    while (dismissalsCount < 3) {
        const { value: gameAction, done: streamConcluded } = eventIterator.next();
        if (streamConcluded) {
            break; 
        }

        switch (gameAction) {
            case 'HIT':
                if (baseOccupancy === 3) {
                    currentScoreboard[currentSquad]++;
                } else {
                    baseOccupancy++;
                }
                break;
            case 'HOMERUN':
                currentScoreboard[currentSquad] += baseOccupancy + 1;
                baseOccupancy = 0;
                break;
            default: // 'OUT' or any other unexpected input
                dismissalsCount++;
                break;
        }
    }
    return { pointsAccumulated: currentScoreboard, activeParticipant: currentSquad, runnersPresent: 0 };
}

function manageTournament(rawGameLog) {
    const playByPlayStream = provideChronicle(rawGameLog);
    const totalInningsCount = parseInt(playByPlayStream.next().value);

    let aggregateScores = [0, 0];
    let designatedBatter = 0;

    for (let inningOpportunity = 0; inningOpportunity < totalInningsCount * 2; inningOpportunity++) {
        const phaseOutcome = conductOffensivePhase({
            pointsAccumulated: aggregateScores,
            activeParticipant: designatedBatter,
            runnersPresent: 0
        }, playByPlayStream);

        aggregateScores = phaseOutcome.pointsAccumulated;
        designatedBatter = (designatedBatter + 1) % 2;
    }

    emitOutcome(aggregateScores[0]);
    emitOutcome(aggregateScores[1]);
}

manageTournament(require("fs").readFileSync("/dev/stdin", "utf8"));