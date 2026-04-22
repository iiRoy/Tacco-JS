const rawData = require('node:fs').readFileSync('/dev/stdin', 'utf8');

const dataLines = rawData.trim().split('\n');

const terminationSequence = "-1 -1 -1";

const assessmentCriteria = [
    {
        predicate: (primary, secondary, supplementary) => primary === -1 || secondary === -1,
        outcome: "F"
    },
    {
        predicate: (primary, secondary, supplementary) => (primary + secondary) >= 80,
        outcome: "A"
    },
    {
        predicate: (primary, secondary, supplementary) => (primary + secondary) >= 65,
        outcome: "B"
    },
    {
        predicate: (primary, secondary, supplementary) => (primary + secondary) >= 50,
        outcome: "C"
    },
    {
        predicate: (primary, secondary, supplementary) => (primary + secondary) >= 30 && supplementary >= 50,
        outcome: "C"
    },
    {
        predicate: (primary, secondary, supplementary) => (primary + secondary) >= 30,
        outcome: "D"
    },
    {
        predicate: (primary, secondary, supplementary) => true,
        outcome: "F"
    }
];

const obtainEvaluation = (componentOne, componentTwo, componentThree) => {
    for (const criterion of assessmentCriteria) {
        if (criterion.predicate(componentOne, componentTwo, componentThree)) {
            return criterion.outcome;
        }
    }
    return "F";
};

const finalGrades = dataLines
    .filter(segment => segment !== terminationSequence)
    .map(segment => {
        const scoreComponents = segment.split(' ').map(Number);
        const [major, minor, supplementary] = scoreComponents;
        return obtainEvaluation(major, minor, supplementary);
    });

console.log(finalGrades.join('\n'));