function processInput(inputString) {
    const patternMatcher = /^(hi)*$/;
    const targetSequence = String(inputString);

    let outcomeIndicator;
    if (patternMatcher.test(targetSequence)) {
        outcomeIndicator = 'Yes';
    } else {
        outcomeIndicator = 'No';
    }

    console.log(outcomeIndicator);
}

processInput(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
