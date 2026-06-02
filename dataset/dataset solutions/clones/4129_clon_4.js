function evaluateBalance(inputLines) {
    const numericComponents = inputLines[0].split(" ").map(Number);

    const [firstValue, secondValue, thirdValue, fourthValue] = numericComponents;

    const aggregateLeft = firstValue + secondValue;
    const aggregateRight = thirdValue + fourthValue;

    const resultMappings = new Map([
        ['equal', 'Balanced'],
        ['greater', 'Left'],
        ['less', 'Right']
    ]);

    let comparisonOutcomeIdentifier;
    if (aggregateLeft === aggregateRight) {
        comparisonOutcomeIdentifier = 'equal';
    } else if (aggregateLeft > aggregateRight) {
        comparisonOutcomeIdentifier = 'greater';
    } else {
        comparisonOutcomeIdentifier = 'less';
    }

    return resultMappings.get(comparisonOutcomeIdentifier);
}

console.log(evaluateBalance(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n")));
