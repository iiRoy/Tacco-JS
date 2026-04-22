function processContestResults(contestData) {
    const lines = contestData.split('\n');

    const [playerCount, initialPoints, questionCount] = lines[0].split(' ').map(Number);

    const correctResponseCounters = Array.from({ length: playerCount }, () => 0);

    for (let currentQuestionIndex = 1; currentQuestionIndex <= questionCount; currentQuestionIndex++) {
        const respondingPlayerIdentifier = Number(lines[currentQuestionIndex]);
        correctResponseCounters[respondingPlayerIdentifier - 1]++;
    }

    const finalOutcomes = correctResponseCounters.map(playerCorrectCount => {
        const pointsLost = questionCount - playerCorrectCount;
        return (pointsLost < initialPoints) ? 'Yes' : 'No';
    });

    console.log(finalOutcomes.join('\n'));
}

processContestResults(require("fs").readFileSync("/dev/stdin", "utf8"));