function computeSolution() {
    const initialConfig = fetchParameters();
    const upperLimit = initialConfig[0];
    const divisorParam = initialConfig[1];

    if (divisorParam === 1) {
        emitOutcome(upperLimit * upperLimit * upperLimit);
        return;
    }

    let countForZeroRemainder = Math.floor(upperLimit / divisorParam);
    let countForHalfRemainder = 0;

    if (divisorParam % 2 === 0) {
        const targetRemainder = divisorParam / 2;
        if (targetRemainder <= upperLimit) {
            countForHalfRemainder = Math.floor((upperLimit - targetRemainder) / divisorParam) + 1;
        }
    }
    
    const finalSum = (countForZeroRemainder * countForZeroRemainder * countForZeroRemainder) +
                     (countForHalfRemainder * countForHalfRemainder * countForHalfRemainder);

    emitOutcome(finalSum);
}