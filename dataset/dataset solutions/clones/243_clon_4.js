const dataCollector = (action) => {
    let buffer = '';
    process.stdin.on('data', (chunk) => {
        buffer += chunk;
    });
    process.stdin.on('end', () => {
        action(buffer.trim().split('\n'));
    });
};

const evaluateGameRound = (roundString) => {
    const componentValues = roundString.split(' ').map(val => parseInt(val, 10));
    const valA = componentValues[0];
    const valB = componentValues[1];
    const valC = componentValues[2];

    const initialCandidateSet = Array.from({ length: 10 }, (_, idx) => idx + 1);

    const validCandidates = initialCandidateSet.filter(candidateNum =>
        !(candidateNum === valA && candidateNum === valB && candidateNum === valC)
    );

    let goodScores = 0;
    let badScores = 0;

    for (const currentCandidate of validCandidates) {
        if ((valA + valB + currentCandidate) <= 20) {
            goodScores++;
        } else {
            badScores++;
        }
    }

    return goodScores > badScores ? "YES" : "NO";
};

dataCollector((inputLines) => {
    for (let currentLine of inputLines) {
        const result = evaluateGameRound(currentLine);
        process.stdout.write(result + '\n');
    }
});