const inputReader = require('readline');

let inputLineData;
let charSequence;

const MOD_VAL = 10**9 + 7;
const TARGET_PATTERN = "ABC";
const PATTERN_LENGTH = TARGET_PATTERN.length;
const DP_COLUMNS = PATTERN_LENGTH + 1;

const interfaceInstance = inputReader.createInterface({
    input: process.stdin,
    output: process.stdout,
});

interfaceInstance.on('line', (currentInput) => {
    inputLineData = currentInput;
});

interfaceInstance.on('close', () => {
    charSequence = inputLineData.split("");
    const sequenceLength = charSequence.length;

    let dpTable = Array.from({ length: sequenceLength + 1 }, () => Array(DP_COLUMNS).fill(0));

    const applyModulo = (value) => (value % MOD_VAL + MOD_VAL) % MOD_VAL;

    for (let currentIdx = sequenceLength; currentIdx >= 0; currentIdx--) {
        for (let patternCharIdx = PATTERN_LENGTH; patternCharIdx >= 0; patternCharIdx--) {
            if (currentIdx === sequenceLength) {
                dpTable[currentIdx][patternCharIdx] = (patternCharIdx === PATTERN_LENGTH ? 1 : 0);
                continue;
            }

            const currentSequenceChar = charSequence[currentIdx];

            let termFromSkippingChar = dpTable[currentIdx + 1][patternCharIdx];
            if (currentSequenceChar === '?') {
                termFromSkippingChar = applyModulo(termFromSkippingChar * 3);
            } else {
                termFromSkippingChar = applyModulo(termFromSkippingChar * 1);
            }

            let termFromMatchingChar = 0;
            if (patternCharIdx < PATTERN_LENGTH &&
                (currentSequenceChar === '?' || currentSequenceChar === TARGET_PATTERN[patternCharIdx])) {
                termFromMatchingChar = dpTable[currentIdx + 1][patternCharIdx + 1];
            }

            dpTable[currentIdx][patternCharIdx] = applyModulo(termFromSkippingChar + termFromMatchingChar);
        }
    }
    console.log(dpTable[0][0]);
});
