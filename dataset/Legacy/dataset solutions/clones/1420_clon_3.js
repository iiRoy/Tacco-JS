const fileSystem = require('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const lineBuffer = rawData.trim().split("\n");

const TERMINATION_SEQUENCE = "-1 -1 -1";

function determineGrade(midtermScore, finalScore, retakeScore) {
    if (midtermScore === -1 && finalScore === -1) {
        return "F";
    }

    const totalCombinedScore = midtermScore + finalScore;
    let calculatedGrade = "F";

    if (totalCombinedScore >= 80) {
        calculatedGrade = "A";
    } else if (totalCombinedScore >= 65) {
        calculatedGrade = "B";
    } else if (totalCombinedScore >= 50) {
        calculatedGrade = "C";
    } else if (totalCombinedScore >= 30) {
        if (retakeScore >= 50) {
            calculatedGrade = "C";
        } else {
            calculatedGrade = "D";
        }
    }
    return calculatedGrade;
}

while (true) {
    const currentLine = lineBuffer.shift();
    if (currentLine === TERMINATION_SEQUENCE) {
        break;
    }

    const scoreStrings = currentLine.split(" ");
    const [midtermScore, finalScore, retakeScore] = scoreStrings.map(Number);

    const finalGrade = determineGrade(midtermScore, finalScore, retakeScore);

    console.log(finalGrade);
}
