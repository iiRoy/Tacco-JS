const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

const inputLines = rawInputData.trim().split("\n");

function calculateStudentGrade(midtermVal, finalVal, retakeVal) {
    let studentGrade = "F";
    const combinedScore = midtermVal + finalVal;

    if (midtermVal === -1 || finalVal === -1) {
        studentGrade = "F";
    } else if (combinedScore >= 80) {
        studentGrade = "A";
    } else if (combinedScore >= 65) {
        studentGrade = "B";
    } else if (combinedScore >= 50) {
        studentGrade = "C";
    } else if (combinedScore >= 30) {
        if (retakeVal >= 50) {
            studentGrade = "C";
        } else {
            studentGrade = "D";
        }
    }
    return studentGrade;
}

while (true) {
    const currentInputLine = inputLines.shift();

    if (currentInputLine === "-1 -1 -1") {
        break;
    }

    const scoreComponents = currentInputLine.split(" ").map(Number);
    const midtermScore = scoreComponents[0];
    const finalScore = scoreComponents[1];
    const retakeScore = scoreComponents[2];

    const finalGrade = calculateStudentGrade(midtermScore, finalScore, retakeScore);

    console.log(finalGrade);
}
