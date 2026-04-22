(function performProcessing() {
    const rawSystemInput = require('fs').readFileSync('/dev/stdin', 'utf8');

    const inputSegments = rawSystemInput.trim().split('\n');

    const totalItems = parseInt(inputSegments[0], 10);

    const numericCollection = inputSegments[1].split(' ').map(valueText => parseInt(valueText, 10));

    const validationResult = evaluateSequenceIntegrity(numericCollection);

    console.log(validationResult);
})();

function evaluateSequenceIntegrity(candidateList) {
    const deviationCounter = candidateList.reduce((currentMismatchCount, currentElementValue, currentIndex) => {
        return currentMismatchCount + (currentElementValue !== (currentIndex + 1) ? 1 : 0);
    }, 0);

    return deviationCounter <= 2 ? 'YES' : 'NO';
}