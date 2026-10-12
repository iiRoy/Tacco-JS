const findCommonDivisor = (a, b) => {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) {
        [x, y] = [y, x % y];
    }
    return x;
};

const createFraction = (numerator, denominator) => {
    if (denominator === 0) {
        throw new Error("Fraction denominator cannot be zero.");
    }
    if (numerator === 0) return [0, 1];

    const common = findCommonDivisor(numerator, denominator);
    let n = numerator / common;
    let d = denominator / common;

    if (d < 0) {
        n = -n;
        d = -d;
    }
    return [n, d];
};

const addFractions = ([n1, d1], [n2, d2]) => {
    return createFraction(n1 * d2 + n2 * d1, d1 * d2);
};

const subtractFractions = ([n1, d1], [n2, d2]) => {
    return createFraction(n1 * d2 - n2 * d1, d1 * d2);
};

const calculateFinalBearing = (inputSequence) => {
    const intermediateString = inputSequence.replace(/orth|est/g, "");
    const processedSequence = Array.from(intermediateString).reverse().join('');

    if (processedSequence.length === 0) {
        return "0";
    }

    let currentAngle = [0, 1];

    const firstChar = processedSequence[0];
    if (firstChar === 'w') {
        currentAngle = [90, 1];
    } else if (firstChar === 'n') {
        currentAngle = [0, 1];
    }

    for (let k = 1; k < processedSequence.length; k++) {
        const char = processedSequence[k];
        const adjustmentFraction = createFraction(90, 1 << k);

        if (char === 'n') {
            currentAngle = subtractFractions(currentAngle, adjustmentFraction);
        } else if (char === 'w') {
            currentAngle = addFractions(currentAngle, adjustmentFraction);
        }
    }

    const [finalNumerator, finalDenominator] = currentAngle;
    if (finalDenominator === 1) {
        return finalNumerator.toString();
    } else {
        return `${finalNumerator}/${finalDenominator}`;
    }
};

const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInput.split("\n");

for (const line of inputLines) {
    const trimmedLine = line.trim();
    if (trimmedLine === "#") {
        break;
    }
    console.log(calculateFinalBearing(trimmedLine));
}
