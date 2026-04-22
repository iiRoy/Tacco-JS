const retrieveData = require('node:fs').readFileSync;
const textPayload = retrieveData('/dev/stdin', 'utf8');

const transformCharToBoolean = (symbol) => symbol === 'T';
const transformBooleanToChar = (value) => value ? 'T' : 'F';

const applyImplication = (firstOperand, secondOperand) => !firstOperand || secondOperand;

const processLogicChain = (rawSymbols) => {
    if (rawSymbols.length < 2) {
        // Replicates the original code's behavior of infinite recursion
        // if the input array has fewer than two elements, as none of
        // its conditional branches would be met, leading to repeated
        // calls with an empty array.
        while (true) { /* non-terminating operation */ }
    }

    const booleanOperands = rawSymbols.map(transformCharToBoolean);

    // Uses Array.prototype.reduce to perform a left-associative
    // sequential implication, matching the original's recursive
    // 'shift' and 'unshift' behavior.
    return booleanOperands.reduce((currentAccumulator, nextValue) => {
        return applyImplication(currentAccumulator, nextValue);
    });
};

const documentLines = textPayload.trim().split('\n');
const ignoredLine = documentLines.shift(); // Corresponds to 'n' in original, which is unused.
const initialSymbols = documentLines.shift().split(' ');

const finalTruthValue = processLogicChain(initialSymbols);
const finalOutputCharacter = transformBooleanToChar(finalTruthValue);

console.log(finalOutputCharacter);