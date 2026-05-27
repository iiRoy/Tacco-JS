const obtainDigitCount = (value) => String(value).length;

function computeMinimumFactorLength(sourceValue) {
    const parsedSource = parseInt(sourceValue);

    let minimumLength = obtainDigitCount(parsedSource);

    const iterationLimit = Math.floor(Math.sqrt(parsedSource));

    minimumLength = Array.from({ length: iterationLimit }, (_, divisorCandidate) => divisorCandidate)
        .reduce((currentMinLength, divisorCandidate) => {
            if (divisorCandidate === 0) {
                return currentMinLength;
            }

            if (parsedSource % divisorCandidate === 0) {
                const complementaryFactor = parsedSource / divisorCandidate;
                const currentPairLength = Math.max(
                    obtainDigitCount(divisorCandidate),
                    obtainDigitCount(complementaryFactor)
                );
                return Math.min(currentMinLength, currentPairLength);
            }
            return currentMinLength;
        }, minimumLength);

    return minimumLength;
}

const rawInput = require("fs").readFileSync("/dev/stdin", "utf8");
const finalOutput = computeMinimumFactorLength(rawInput);
console.log('%s', finalOutput);
