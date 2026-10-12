const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const scoreRecords = fileContent.split('\n');

const TERMINATION_VALUE_SUM = -3;

function parseScoreLine(lineString) {
    const scoreParts = lineString.split(' ');
    const parsedMidterm = parseInt(scoreParts[0], 10);
    const parsedFinal = parseInt(scoreParts[1], 10);
    const parsedRetake = parseInt(scoreParts[2], 10);
    return {
        midterm: parsedMidterm,
        final: parsedFinal,
        retake: parsedRetake
    };
}

function determineStudentGrade(midtermScore, finalScore, retakeScore) {
    const primaryScoreSum = midtermScore + finalScore;

    if (midtermScore === -1 || finalScore === -1) {
        return 'F';
    }

    if (primaryScoreSum >= 80) {
        return 'A';
    } else if (primaryScoreSum >= 65) {
        return 'B';
    } else if (primaryScoreSum >= 50) {
        return 'C';
    } else if (primaryScoreSum >= 30) {
        if (retakeScore >= 50) {
            return 'C';
        } else {
            return 'D';
        }
    } else {
        return 'F';
    }
}

let recordPointer = 0;

while (true) {
    const currentRecordLine = scoreRecords[recordPointer++];
    const { midterm: currentM, final: currentF, retake: currentR } = parseScoreLine(currentRecordLine);

    if (currentM + currentF + currentR === TERMINATION_VALUE_SUM) {
        break;
    }

    const gradeOutput = determineStudentGrade(currentM, currentF, currentR);
    console.log(gradeOutput);
}
