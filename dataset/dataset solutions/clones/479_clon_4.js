const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = sourceData.trim().split('\n');

const generateExpectedUtterance = (cycleCount) => {
    let resultPhrase = '';
    if (cycleCount % 3 === 0) resultPhrase += 'Fizz';
    if (cycleCount % 5 === 0) resultPhrase += 'Buzz';
    return resultPhrase || String(cycleCount);
};

const extractGameScenarios = (rawLines) => {
    const gameScenarios = [];
    let currentLineIndex = 0;
    while (currentLineIndex < rawLines.length) {
        const roundSpecs = rawLines[currentLineIndex].split(' ').map(Number);
        const participantInitialCount = roundSpecs[0];
        const utteranceTotalCount = roundSpecs[1];
        currentLineIndex++;

        if (participantInitialCount === 0 && utteranceTotalCount === 0) {
            break;
        }

        const utteranceSequence = [];
        for (let j = 0; j < utteranceTotalCount; j++) {
            utteranceSequence.push(rawLines[currentLineIndex]);
            currentLineIndex++;
        }

        gameScenarios.push({
            initialParticipants: participantInitialCount,
            totalUtterances: utteranceTotalCount,
            utterances: utteranceSequence
        });
    }
    return gameScenarios;
};

const conductRound = (scenario) => {
    const initialActiveContestants = Array.from({ length: scenario.initialParticipants }, (_, pIdx) => pIdx + 1);

    const finalRoundState = scenario.utterances.reduce((stateAccumulator, spokenWordFromPlayer, turnZeroBased) => {
        const { remainingContestants, speakerCursor } = stateAccumulator;
        const gameCycleNumber = turnZeroBased + 1;

        if (remainingContestants.length === 0) {
            return stateAccumulator;
        }

        const requiredPhrase = generateExpectedUtterance(gameCycleNumber);
        
        let nextContestants = [...remainingContestants];
        let nextSpeakerCursor = speakerCursor;

        if (spokenWordFromPlayer !== requiredPhrase) {
            nextContestants.splice(speakerCursor, 1);
        }
        
        nextSpeakerCursor = (nextSpeakerCursor + 1);
        
        if (nextContestants.length > 0) {
            nextSpeakerCursor %= nextContestants.length;
        } else {
            nextSpeakerCursor = 0;
        }

        return {
            remainingContestants: nextContestants,
            speakerCursor: nextSpeakerCursor
        };
    }, { remainingContestants: initialActiveContestants, speakerCursor: 0 });

    return finalRoundState.remainingContestants;
};

const allGameScenarios = extractGameScenarios(lineSegments);

for (const scenario of allGameScenarios) {
    const finalContestants = conductRound(scenario);
    console.log(finalContestants.join(' '));
}