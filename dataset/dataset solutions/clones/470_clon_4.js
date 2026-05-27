const computeGCD = (valA, valB) => (valB === 0 ? valA : computeGCD(valB, valA % valB));

const computeLCM = (values) => {
    if (values.length === 0) return 1;
    return values.reduce((accumulator, currentVal) => (accumulator * currentVal) / computeGCD(accumulator, currentVal), 1);
};

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputContent.trim().split('\n');
let currentLinePointer = 0;

while (true) {
    const entryCount = Number(inputLines[currentLinePointer++]);
    if (entryCount === 0) break;

    const initialFractionPairs = [];
    for (let idx = 0; idx < entryCount; idx++) {
        const numericParts = inputLines[currentLinePointer++].split(' ').map(Number);
        initialFractionPairs.push({ numeratorVal: numericParts[0], denominatorVal: numericParts[1] });
    }

    const reducedFractions = initialFractionPairs.map(pair => {
        const divisorForReduction = computeGCD(pair.numeratorVal, pair.denominatorVal);
        return {
            num: pair.numeratorVal / divisorForReduction,
            den: pair.denominatorVal / divisorForReduction
        };
    });

    const allDenominators = reducedFlections.map(fraction => fraction.den);
    const overallDenominatorLCM = computeLCM(allDenominators);

    const adjustedNumerators = reducedFractions.map(fraction => fraction.num * (overallDenominatorLCM / fraction.den));

    const finalNumeratorLCM = computeLCM(adjustedNumerators);

    adjustedNumerators.forEach(adjustedNum => {
        console.log(finalNumeratorLCM / adjustedNum);
    });
}
