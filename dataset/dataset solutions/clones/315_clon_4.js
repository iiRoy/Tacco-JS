let rawStream = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
    rawStream += chunk;
});

process.stdin.on('end', function() {
    const parsedLines = rawStream.trim().split('\n');

    const initialSetup = parsedLines.shift().split(' ').map(Number);
    const participantCount = initialSetup[0];

    const participantRecords = Array.from({ length: participantCount }, () => 0);
    let currentTopScore = 0;
    let topPerformerIndex = 0;

    const findOptimalPlayer = (playerScores) => {
        let optimalValue = Number.NEGATIVE_INFINITY;
        let optimalIndex = 0;
        for (let itemPosition = 0; itemPosition < playerScores.length; ++itemPosition) {
            const itemValue = playerScores[itemPosition];
            if (itemValue > optimalValue) {
                optimalValue = itemValue;
                optimalIndex = itemPosition;
            }
        }
        return { val: optimalValue, idx: optimalIndex };
    };

    for (const segmentDetails of parsedLines) {
        const individualScoreChange = segmentDetails.split(' ').map(Number);
        const affectedId = individualScoreChange[0] - 1;
        const deltaAmount = individualScoreChange[1];

        participantRecords[affectedId] += deltaAmount;

        if (affectedId === topPerformerIndex && deltaAmount >= 0) {
            currentTopScore += deltaAmount;
        } else if (affectedId === topPerformerIndex && deltaAmount < 0) {
            const newOptimal = findOptimalPlayer(participantRecords);
            currentTopScore = newOptimal.val;
            topPerformerIndex = newOptimal.idx;
        }

        console.log((topPerformerIndex + 1) + ' ' + currentTopScore);
    }
});