process.stdin.setEncoding('utf-8');

const gradeThresholds = [
    { minimumScore: 80, outcome: "A" },
    { minimumScore: 65, outcome: "B" },
    { minimumScore: 50, outcome: "C" }
];

process.stdin.on('data', (inputLine) => {
    const scoreComponents = inputLine.trim().split(" ");

    const numericalValues = scoreComponents.map(Number);

    const [firstScore, secondScore, thirdScore] = numericalValues;

    if (firstScore === -1 && secondScore === -1 && thirdScore === -1) {
        process.exit();
    }

    const adjustedFirst = firstScore === -1 ? 0 : firstScore;
    const adjustedSecond = secondScore === -1 ? 0 : secondScore;

    const totalCombinedScore = adjustedFirst + adjustedSecond;

    let finalAssessment = "F";

    const matchedRule = gradeThresholds.find(rule => totalCombinedScore >= rule.minimumScore);

    if (matchedRule) {
        finalAssessment = matchedRule.outcome;
    } else if (totalCombinedScore >= 30) {
        finalAssessment = thirdScore >= 50 ? "C" : "D";
    }

    console.log(finalAssessment);
});
