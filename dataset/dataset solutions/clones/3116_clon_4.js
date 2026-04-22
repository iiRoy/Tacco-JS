const diskOperations = require('fs');
const processControl = require('process');

const acquireNumericalFeed = () => {
    const rawInputContent = diskOperations.readFileSync(processControl.stdin.fd, 'utf8');
    const numericalTokens = rawInputContent
        .split(/\s+/)
        .filter(Boolean)
        .map(val => parseInt(val, 10))
        .filter(val => !isNaN(val));

    let currentDatumIndex = 0;

    return () => {
        if (currentDatumIndex < numericalTokens.length) {
            return numericalTokens[currentDatumIndex++];
        }
        return null;
    };
};

(() => {
    const retrieveNextDatum = acquireNumericalFeed();
    const primaryValue = retrieveNextDatum();

    if (primaryValue === null || primaryValue === undefined) {
        return;
    }

    const sumToAvoid = primaryValue + (primaryValue % 2 === 0 ? 1 : 0);

    const results = Array.from({ length: primaryValue }, (_, firstIdx) => firstIdx + 1)
        .flatMap(firstOperand =>
            Array.from({ length: primaryValue - firstOperand }, (_, secondIdx) => secondIdx + firstOperand + 1)
                .filter(secondOperand => firstOperand + secondOperand !== sumToAvoid)
                .map(secondOperand => `${firstOperand} ${secondOperand}`)
        );

    processControl.stdout.write(results.join('\n') + '\n');
})();