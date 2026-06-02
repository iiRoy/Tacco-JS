(async () => {
    let inputBuffer = '';
    for await (const dataChunk of process.stdin) inputBuffer += dataChunk;
    const modulusValue = +inputBuffer;

    function calculateDivisibleCount(currentRemainder, currentIteration, targetModulus) {
        if (currentRemainder === 0 && currentIteration > 0) {
            return currentIteration;
        }
        if (currentIteration > targetModulus) {
            return -1;
        }
        const nextRemainder = (currentRemainder * 10 + 7) % targetModulus;
        return calculateDivisibleCount(nextRemainder, currentIteration + 1, targetModulus);
    }

    const outcome = calculateDivisibleCount(0, 0, modulusValue);
    console.log(outcome);
})();
