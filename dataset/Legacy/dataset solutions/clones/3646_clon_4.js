let inputLineData;
let characterSequence;
const MOD_CONSTANT = Math.pow(10, 9) + 7;
const TARGET_SEQUENCE = "ABC";

let memoizationCache;

function calculateCombinations(currentIndex, currentMatchState) {
    if (currentIndex === characterSequence.length) {
        return currentMatchState === TARGET_SEQUENCE.length ? 1 : 0;
    }

    if (memoizationCache[currentIndex][currentMatchState] !== -1) {
        return memoizationCache[currentIndex][currentMatchState];
    }

    let totalWays = 0;
    const currentChar = characterSequence[currentIndex];

    let nonAdvancingMultiplier = 1;
    if (currentChar === '?') {
        nonAdvancingMultiplier = 3;
    }
    totalWays = (calculateCombinations(currentIndex + 1, currentMatchState) * nonAdvancingMultiplier) % MOD_CONSTANT;

    if (currentMatchState < TARGET_SEQUENCE.length) {
        if (currentChar === '?' || currentChar === TARGET_SEQUENCE[currentMatchState]) {
            totalWays = (totalWays + calculateCombinations(currentIndex + 1, currentMatchState + 1)) % MOD_CONSTANT;
        }
    }

    memoizationCache[currentIndex][currentMatchState] = totalWays;
    return totalWays;
}

var inputReader = require('readline');
var rlInterface = inputReader.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rlInterface.on('line', function (x) {
    inputLineData = x;
});

rlInterface.on('close', function () {
    characterSequence = inputLineData.split("");

    memoizationCache = Array(characterSequence.length + 1).fill(null).map(() => Array(TARGET_SEQUENCE.length + 1).fill(-1));

    const finalResult = calculateCombinations(0, 0);

    console.log(finalResult);
});
