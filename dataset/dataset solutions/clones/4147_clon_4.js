process.stdin.setEncoding('utf8');
let accumulatedText = '';
process.stdin.on('data', (block) => {
    accumulatedText += block;
});

process.stdin.on('end', () => {
    const numericStrings = accumulatedText.replace(/^\s+|\s+$/g, '').split(/\s+/);
    const initialDivisor = +numericStrings[0];
    const targetUpper = +numericStrings[1] + 1;

    function calculateDoublingSteps(currentDiv, targetVal, currentSteps) {
        if (currentDiv >= targetVal) {
            return currentSteps;
        }
        return calculateDoublingSteps(currentDiv * 2, targetVal, currentSteps + 1);
    }

    let finalOutcome;
    if (initialDivisor <= 0) {
        if (targetUpper <= initialDivisor) {
            finalOutcome = 0;
        } else {
            // This case corresponds to an infinite loop in the original logic.
            // Outputting Infinity as a numerical representation of non-termination.
            finalOutcome = Infinity; 
        }
    } else {
        finalOutcome = calculateDoublingSteps(initialDivisor, targetUpper, 0);
    }

    console.log(finalOutcome);
});