const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const gradeEvaluationRules = [
    {
        condition: (primaryScore, secondaryScore, supplementaryScore) => primaryScore === -1 || secondaryScore === -1,
        outcome: "F"
    },
    {
        condition: (primaryScore, secondaryScore, supplementaryScore) => primaryScore + secondaryScore >= 80,
        outcome: "A"
    },
    {
        condition: (primaryScore, secondaryScore, supplementaryScore) => primaryScore + secondaryScore >= 65,
        outcome: "B"
    },
    {
        condition: (primaryScore, secondaryScore, supplementaryScore) => primaryScore + secondaryScore >= 50,
        outcome: "C"
    },
    {
        condition: (primaryScore, secondaryScore, supplementaryScore) => primaryScore + secondaryScore >= 30 && supplementaryScore >= 50,
        outcome: "C"
    },
    {
        condition: (primaryScore, secondaryScore, supplementaryScore) => primaryScore + secondaryScore >= 30,
        outcome: "D"
    }
];

const deriveFinalGrade = (scoreOne, scoreTwo, scoreThree) => {
    const matchedRule = gradeEvaluationRules.find(rule =>
        rule.condition(scoreOne, scoreTwo, scoreThree)
    );
    return matchedRule ? matchedRule.outcome : "F";
};

rawInputData
    .trim()
    .split("\n")
    .filter(lineContent => lineContent !== "-1 -1 -1")
    .forEach(lineContent => {
        const numericValues = lineContent.split(" ").map(Number);
        const [firstExam, secondExam, makeupExam] = numericValues;

        const computedGrade = deriveFinalGrade(firstExam, secondExam, makeupExam);
        console.log(computedGrade);
    });
