const valueRules = [
    { lowerBoundary: 400, upperBoundary: 599, resultValue: 8 },
    { lowerBoundary: 600, upperBoundary: 799, resultValue: 7 },
    { lowerBoundary: 800, upperBoundary: 999, resultValue: 6 },
    { lowerBoundary: 1000, upperBoundary: 1199, resultValue: 5 },
    { lowerBoundary: 1200, upperBoundary: 1399, resultValue: 4 },
    { lowerBoundary: 1400, upperBoundary: 1599, resultValue: 3 },
    { lowerBoundary: 1600, upperBoundary: 1799, resultValue: 2 },
    { lowerBoundary: 1800, upperBoundary: 1999, resultValue: 1 }
];

const determineOutcome = (inputCriterion) => {
    const applicableRule = valueRules.find(rule => 
        inputCriterion > rule.lowerBoundary && inputCriterion < rule.upperBoundary
    );

    if (applicableRule) {
        console.log(applicableRule.resultValue);
    }
};

const rawInput = process.argv[2];
const parsedInput = parseInt(rawInput, 10);

if (!isNaN(parsedInput)) {
    determineOutcome(parsedInput);
}