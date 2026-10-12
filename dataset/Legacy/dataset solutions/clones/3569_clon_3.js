function processInputData(rawInputString) {
    const parsedNumbers = rawInputString.split(' ');
    const upperLimit = parseInt(parsedNumbers[0]);
    const moduloDivisor = parseInt(parsedNumbers[1]);
    let totalTriplets = 0;

    const getAdjustedStartValue = (value, divisor) => {
        const remainder = value % divisor;
        return remainder === 0 ? divisor : remainder;
    };

    const checkCombinedRemainderCondition = (valA, divisor) => {
        const remainderA = valA % divisor;
        return (2 * remainderA) % divisor === 0;
    };

    for (let currentA = 1; currentA <= upperLimit; currentA++) {
        if (checkCombinedRemainderCondition(currentA, moduloDivisor)) {
            const initialLoopValue = getAdjustedStartValue(currentA, moduloDivisor);
            const countForInnerLoops = Math.floor((upperLimit - initialLoopValue) / moduloDivisor) + 1;
            totalTriplets += countForInnerLoops * countForInnerLoops;
        }
    }
    console.log(totalTriplets);
}
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
