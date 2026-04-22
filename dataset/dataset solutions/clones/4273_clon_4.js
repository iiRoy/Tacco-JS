const obtainAndProcess = () => {
    const entryData = require('node:fs').readFileSync('/dev/stdin', 'utf-8');
    const parsedNumbers = entryData.match(/\d+/g).map(Number);

    const iterationCount = parsedNumbers[0];
    const additionCap = parsedNumbers[1];

    const finalOutcome = Array.from({ length: iterationCount }).reduce((accumulatedValue) => {
        const incrementAmount = Math.min(additionCap, accumulatedValue);
        return accumulatedValue + incrementAmount;
    }, 1);

    process.stdout.write(finalOutcome.toString() + '\n');
};

obtainAndProcess();