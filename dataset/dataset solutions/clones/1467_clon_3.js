process.stdin.on("data", function(inputBuffer) {
    let scorePlayerOne = 0;
    let scorePlayerTwo = 0;

    const rawInputString = inputBuffer.toString();
    const processedInput = rawInputString.trim();
    const allInputLines = processedInput.split("\n");
    const dataLines = allInputLines.slice(1);

    dataLines.forEach(function(currentMatchLine) {
        const matchValues = currentMatchLine.split(" ");
        const firstParticipantScore = matchValues[0];
        const secondParticipantScore = matchValues[1];

        if (firstParticipantScore === secondParticipantScore) {
            scorePlayerOne++;
            scorePlayerTwo++;
        } else if (firstParticipantScore > secondParticipantScore) {
            scorePlayerOne += 3;
        } else {
            scorePlayerTwo += 3;
        }
    });

    console.log(scorePlayerOne, scorePlayerTwo);
}).resume();
