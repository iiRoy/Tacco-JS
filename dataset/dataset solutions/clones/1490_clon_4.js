const power = (base, exp, modulus) => {
    let result = 1;
    base %= modulus;
    while (exp > 0) {
        if (exp % 2 === 1) result = (result * base) % modulus;
        base = (base * base) % modulus;
        exp = Math.floor(exp / 2);
    }
    return result;
};

const MODULUS_VALUE = 998244353;

const modularInverse = (num, modulus) => power(num, modulus - 2, modulus);
const INVERSE_OF_NINE = modularInverse(9, MODULUS_VALUE);

const computeSegmentContribution = (digit, length, modulus) => {
    if (length === 0) return 0;
    const tenToPowerLength = power(10, length, modulus);
    const term = (tenToPowerLength - 1 + modulus) % modulus;
    return (digit * term % modulus * INVERSE_OF_NINE) % modulus;
};

(async () => {
    let incomingData = '';
    for await (const dataBlock of process.stdin) incomingData += dataBlock;
    const allInputLines = incomingData.split('\n');

    const [totalArraySize, totalQueryCount] = allInputLines[0].split(' ').map(Number);
    const queryOperations = allInputLines.slice(1, totalQueryCount + 1).map(line => line.split(' ').map(Number));

    let currentSegments;
    if (totalArraySize > 0) {
        currentSegments = [{ start: 0, end: totalArraySize - 1, value: 1 }];
    } else {
        currentSegments = [];
    }

    const displayAggregatedNumber = () => {
        let accumulatedValue = 0;

        for (const segment of currentSegments) {
            const segmentLength = segment.end - segment.start + 1;

            accumulatedValue = (accumulatedValue * power(10, segmentLength, MODULUS_VALUE)) % MODULUS_VALUE;

            const segmentNumericalContribution = computeSegmentContribution(segment.value, segmentLength, MODULUS_VALUE);
            accumulatedValue = (accumulatedValue + segmentNumericalContribution) % MODULUS_VALUE;
        }
        console.log(accumulatedValue);
    };

    for (const operation of queryOperations) {
        const [leftIndex, rightIndex, digitToSet] = [operation[0] - 1, operation[1] - 1, operation[2]];

        let updatedSegments = [];

        for (const existingSegment of currentSegments) {
            if (existingSegment.end < leftIndex) {
                updatedSegments.push(existingSegment);
            } else if (existingSegment.start > rightIndex) {
                updatedSegments.push(existingSegment);
            } else {
                if (existingSegment.start < leftIndex) {
                    updatedSegments.push({ start: existingSegment.start, end: leftIndex - 1, value: existingSegment.value });
                }
                if (existingSegment.end > rightIndex) {
                    updatedSegments.push({ start: rightIndex + 1, end: existingSegment.end, value: existingSegment.value });
                }
            }
        }

        updatedSegments.push({ start: leftIndex, end: rightIndex, value: digitToSet });

        updatedSegments.sort((a, b) => a.start - b.start);

        let consolidatedSegments = [];
        if (updatedSegments.length > 0) {
            consolidatedSegments.push(updatedSegments[0]);
            for (let i = 1; i < updatedSegments.length; i++) {
                const lastConsolidated = consolidatedSegments[consolidatedSegments.length - 1];
                const currentCandidate = updatedSegments[i];

                if (currentCandidate.value === lastConsolidated.value && currentCandidate.start === lastConsolidated.end + 1) {
                    lastConsolidated.end = currentCandidate.end;
                } else {
                    consolidatedSegments.push(currentCandidate);
                }
            }
        }
        currentSegments = consolidatedSegments;

        displayAggregatedNumber();
    }
})();
