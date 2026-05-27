const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineBuffer = rawData.trim().split('\n');

while (true) {
    const currentDimensionLine = lineBuffer.shift();
    const dimensionParts = currentDimensionLine.split(' ');
    const gameDimensions = dimensionParts.map(Number);

    const numParticipants = gameDimensions[0];
    const numCategories = gameDimensions[1];

    if (numParticipants === 0 && numCategories === 0) {
        break;
    }

    const participantScores = [];
    const initialScoreValue = 0;
    for (let categoryIdx = 0; categoryIdx < numCategories; categoryIdx++) {
        participantScores.push([categoryIdx + 1, initialScoreValue]);
    }

    for (let participantIdx = 0; participantIdx < numParticipants; participantIdx++) {
        const scoreInputLine = lineBuffer.shift();
        const individualScoreStrings = scoreInputLine.split(' ');
        const individualScores = individualScoreStrings.map(Number);

        for (let categoryIdx = 0; categoryIdx < individualScores.length; categoryIdx++) {
            const scoreToAdd = individualScores[categoryIdx];
            participantScores[categoryIdx][1] += scoreToAdd;
        }
    }

    participantScores.sort((firstEntry, secondEntry) => {
        const scoreOfFirst = firstEntry[1];
        const scoreOfSecond = secondEntry[1];
        const idOfFirst = firstEntry[0];
        const idOfSecond = secondEntry[0];

        if (scoreOfFirst === scoreOfSecond) {
            return idOfFirst - idOfSecond;
        } else {
            return scoreOfSecond - scoreOfFirst;
        }
    });

    const finalOrderOfIds = participantScores.map(entry => {
        const participantId = entry[0];
        return participantId;
    });

    console.log(finalOrderOfIds.join(' '));
}
