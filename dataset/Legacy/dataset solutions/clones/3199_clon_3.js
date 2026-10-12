function checkCondition(firstNumber, secondNumber) {
    const doubleOfSecond = secondNumber * 2;
    const incrementedFirst = firstNumber + 1;
    const finalDifference = incrementedFirst - doubleOfSecond;
    return finalDifference >= 0;
}

function processInput(rawInputString) {
    const processedString = rawInputString.replace(/\r?\n/g, "");
    const stringParts = processedString.split(" ");
    
    const stringValueA = stringParts[0];
    const stringValueB = stringParts[1];

    const numericValueA = Number(stringValueA);
    const numericValueB = Number(stringValueB);

    const conditionMet = checkCondition(numericValueA, numericValueB);

    if (conditionMet) {
        console.log("YES");
    } else {
        console.log("NO");
    }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
