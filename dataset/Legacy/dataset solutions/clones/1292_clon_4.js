const fileSystem = require('fs');

const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const scoreEntries = rawData.trim().split('\n');

const calculateStudentGrade = (midtermScore, finalScore, retakeScore) => {
    if (midtermScore === -1 || finalScore === -1) {
        return 'F';
    }

    const combinedScore = midtermScore + finalScore;

    const gradingCriteria = [
        { check: (sum, r_val) => sum >= 80, outcome: 'A' },
        { check: (sum, r_val) => sum >= 65, outcome: 'B' },
        { check: (sum, r_val) => sum >= 50, outcome: 'C' },
        { check: (sum, r_val) => sum >= 30 && r_val >= 50, outcome: 'C' },
        { check: (sum, r_val) => sum >= 30 && r_val < 50, outcome: 'D' },
        { check: (sum, r_val) => true, outcome: 'F' }
    ];

    const matchedCriterion = gradingCriteria.find(criterion => criterion.check(combinedScore, retakeScore));
    return matchedCriterion.outcome;
};

scoreEntries
    .filter(entry => entry !== '-1 -1 -1')
    .forEach(entryString => {
        const [midtermScore, finalScore, retakeScore] = entryString.split(' ').map(Number);
        const computedGrade = calculateStudentGrade(midtermScore, finalScore, retakeScore);
        console.log(computedGrade);
    });
