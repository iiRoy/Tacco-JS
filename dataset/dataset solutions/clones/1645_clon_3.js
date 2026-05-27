function processInputAndDetermineOutcome(rawInputString) {
    const inputLines = rawInputString.split('\n');

    const stringValues = inputLines[0].split(' ');
    let currentValues = stringValues.map(Number);

    const iterationLimit = Number(inputLines[1]);

    let valA = currentValues[0];
    let valB = currentValues[1];
    let valC = currentValues[2];

    for (let loopCounter = 0; loopCounter < iterationLimit; loopCounter++) {
        const isBGreaterThanOrEqualToC = valB >= valC;
        if (isBGreaterThanOrEqualToC) {
            valC = valC * 2;
        } else {
            const isAGreaterThanOrEqualToB = valA >= valB;
            if (isAGreaterThanOrEqualToB) {
                valB = valB * 2;
            }
        }
    }

    currentValues[0] = valA;
    currentValues[1] = valB;
    currentValues[2] = valC;

    const finalCheckConditionB = currentValues[1] <= currentValues[2];
    const finalCheckConditionA = currentValues[0] <= currentValues[1];

    if (finalCheckConditionB && finalCheckConditionA) {
        console.log('yes');
    } else {
        console.log('no');
    }
}

processInputAndDetermineOutcome(require('fs').readFileSync('/dev/stdin', 'utf8'));
