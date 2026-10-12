const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const inputEntries = fileContent.trim().split("\n");

const evaluationCriteria = [
    { condition: (scoreOne, scoreTwo, scoreThree) => scoreOne === -1 && scoreTwo === -1, gradeResult: "F" },
    { condition: (scoreOne, scoreTwo, scoreThree) => scoreOne + scoreTwo >= 80, gradeResult: "A" },
    { condition: (scoreOne, scoreTwo, scoreThree) => scoreOne + scoreTwo >= 65, gradeResult: "B" },
    { condition: (scoreOne, scoreTwo, scoreThree) => scoreOne + scoreTwo >= 50, gradeResult: "C" },
    { condition: (scoreOne, scoreTwo, scoreThree) => scoreOne + scoreTwo >= 30 && scoreThree >= 50, gradeResult: "C" },
    { condition: (scoreOne, scoreTwo, scoreThree) => scoreOne + scoreTwo >= 30, gradeResult: "D" },
];

const deriveFinalGrade = (primaryScore, secondaryScore, tertiaryScore) => {
    const matchingCriterion = evaluationCriteria.find(criterion =>
        criterion.condition(primaryScore, secondaryScore, tertiaryScore)
    );
    return matchingCriterion ? matchingCriterion.gradeResult : "F";
};

inputEntries
    .filter(lineData => lineData !== "-1 -1 -1")
    .forEach(lineData => {
        const [val1, val2, val3] = lineData.split(" ").map(Number);
        const finalAssessment = deriveFinalGrade(val1, val2, val3);
        console.log(finalAssessment);
    });
