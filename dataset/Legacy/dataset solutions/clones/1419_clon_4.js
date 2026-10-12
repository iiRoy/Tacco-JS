const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataRows = fileContent.split('\n');

const evaluationCriteria = [
    { check: (s1, s2, s3) => s1 === -1 || s2 === -1, outcome: 'F' },
    { check: (s1, s2, s3) => s1 + s2 >= 80, outcome: 'A' },
    { check: (s1, s2, s3) => s1 + s2 >= 65, outcome: 'B' },
    { check: (s1, s2, s3) => s1 + s2 >= 50, outcome: 'C' },
    { check: (s1, s2, s3) => s1 + s2 >= 30 && s3 >= 50, outcome: 'C' },
    { check: (s1, s2, s3) => s1 + s2 >= 30, outcome: 'D' },
    { check: (s1, s2, s3) => true, outcome: 'F' }
];

for (const currentLine of dataRows) {
    const stringScores = currentLine.split(' ');
    const firstScore = Number(stringScores[0]);
    const secondScore = Number(stringScores[1]);
    const resitScore = Number(stringScores[2]);

    if (firstScore + secondScore + resitScore === -3) {
        break;
    }

    let finalGrade = '';
    for (const rule of evaluationCriteria) {
        if (rule.check(firstScore, secondScore, resitScore)) {
            finalGrade = rule.outcome;
            break;
        }
    }
    console.log(finalGrade);
}
