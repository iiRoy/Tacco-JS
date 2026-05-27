const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputData.trim().split(/\n/g);

function determineStudentGrade(midtermScore, finalScore, resitScore) {
    let calculatedGradeResult;

    if (midtermScore === -1 || finalScore === -1) {
        calculatedGradeResult = 'F';
    } else {
        const combinedScoreTotal = midtermScore + finalScore;
        if (combinedScoreTotal >= 80) {
            calculatedGradeResult = 'A';
        } else if (combinedScoreTotal >= 65) {
            calculatedGradeResult = 'B';
        } else if (combinedScoreTotal >= 50) {
            calculatedGradeResult = 'C';
        } else if (combinedScoreTotal >= 30) {
            if (resitScore >= 50) {
                calculatedGradeResult = 'C';
            } else {
                calculatedGradeResult = 'D';
            }
        } else {
            calculatedGradeResult = 'F';
        }
    }
    return calculatedGradeResult;
}

const terminationConditionString = '-1 -1 -1';

for (let lineIndex = 0; lineIndex < inputLines.length; lineIndex++) {
    const currentInputLine = inputLines[lineIndex];

    if (currentInputLine === terminationConditionString) {
        break;
    }

    const scoreComponents = currentInputLine.split(' ').map(Number);
    const studentMidtermScore = scoreComponents[0];
    const studentFinalScore = scoreComponents[1];
    const studentResitScore = scoreComponents[2];
    
    const studentOverallGrade = determineStudentGrade(studentMidtermScore, studentFinalScore, studentResitScore);
    
    console.log(studentOverallGrade);
}
