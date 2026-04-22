const initiateSequence = (incomingSource) => {
    const numericalBoundary = +incomingSource.replace(/\s/g, '');
    const ultimateOutcome = ascertainEightFactorOddCount(numericalBoundary);
    process.stdout.write(String(ultimateOutcome));
};

const enumerateDivisors = (figure) => {
    return Array.from({ length: figure }, (_, index) => index + 1)
                .filter(candidate => figure % candidate === 0)
                .length;
};

const ascertainEightFactorOddCount = (limitValue) => {
    return Array.from({ length: limitValue }, (_, currentIdx) => currentIdx + 1)
                .filter(item => item % 2 !== 0)
                .filter(oddItem => enumerateDivisors(oddItem) === 8)
                .length;
};

initiateSequence(require("node:fs").readFileSync("/dev/stdin", "utf8"));