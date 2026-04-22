function calculateAlternations(sourceData) {
    const textSegment = sourceData[0];
    const charEntities = textSegment.split('');

    if (charEntities.length < 2) {
        return 0;
    }

    const alternationCount = charEntities.slice(1).reduce((currentTally, presentChar, idx) => {
        const priorChar = charEntities[idx];
        if (presentChar !== priorChar) {
            return currentTally + 1;
        }
        return currentTally;
    }, 0);

    return alternationCount;
}

(function() {
    const inputPayload = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n");
    const finalOutcome = calculateAlternations(inputPayload);
    console.log(finalOutcome);
})();