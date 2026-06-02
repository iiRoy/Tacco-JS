function ProcessInput(inputString) {
    const [limitStr, divisorStr] = inputString.split(' ');
    const upperLimit = Number.parseInt(limitStr, 10);
    const modulusDivisor = Number.parseInt(divisorStr, 10);

    let cumulativeSum = 0;

    for (let currentRemainder = 0; currentRemainder < modulusDivisor; currentRemainder++) {
        const countMatchingRemainder = (currentRemainder === 0)
            ? Math.floor(upperLimit / modulusDivisor)
            : Math.floor((upperLimit - currentRemainder) / modulusDivisor) + 1;

        if ((2 * currentRemainder) % modulusDivisor === 0) {
            cumulativeSum += countMatchingRemainder * countMatchingRemainder * countMatchingRemainder;
        }
    }

    console.log(cumulativeSum);
}

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
