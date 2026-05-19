function processCompetitionResults(rawInputString) {
    const parseConfigLine = (lineContent) => lineContent.split(" ").map(Number);

    let inputLines = rawInputString.split("\n");

    const initialConfiguration = parseConfigLine(inputLines[0]);

    const totalParticipantsCount = initialConfiguration[0];
    const initialPointsAwarded = initialConfiguration[1];
    const pointsDeductedPerQuestion = initialConfiguration[2];

    const startingScorePerParticipant = initialPointsAwarded - pointsDeductedPerQuestion;

    let participantScores = new Array(totalParticipantsCount + 1).fill(startingScorePerParticipant);

    inputLines.shift();

    inputLines.forEach(function(participantIdentifierString) {
        const participantId = Number(participantIdentifierString);
        if (participantId > 0 && participantId <= totalParticipantsCount) {
            participantScores[participantId]++;
        }
    });

    for (let i = 1; i <= totalParticipantsCount; i++) {
        const finalScore = participantScores[i];
        const hasPassed = finalScore >= 1;
        console.log(hasPassed ? "Yes" : "No");
    }
}

processCompetitionResults(require("fs").readFileSync("/dev/stdin", "utf8").trim());
