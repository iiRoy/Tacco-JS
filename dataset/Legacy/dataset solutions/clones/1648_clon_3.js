function determineComparisonFactor(targetValue, baseValue) {
    let factorResult;
    if (baseValue > targetValue) {
        factorResult = 0;
    } else if (baseValue === targetValue) {
        factorResult = 1;
    } else if (baseValue < targetValue && (2 * baseValue) >= targetValue) {
        factorResult = 1;
    } else if ((2 * baseValue) < targetValue && (4 * baseValue) >= targetValue) {
        factorResult = 2;
    } else if ((4 * baseValue) < targetValue && (8 * baseValue) >= targetValue) {
        factorResult = 3;
    }
    return factorResult;
}

function processInputData(rawInputString) {
    const inputLines = rawInputString.split('\n');
    const firstLineElements = inputLines[0].split(" ");

    const primaryOperand = Number(firstLineElements[0]);
    const secondaryOperand = Number(firstLineElements[1]);
    const tertiaryOperand = Number(firstLineElements[2]);
    const comparisonThreshold = Number(inputLines[1]);

    let firstComputedValue;
    let secondComputedValue;

    firstComputedValue = determineComparisonFactor(primaryOperand, secondaryOperand);

    const DOUBLE_FACTOR = 2;
    const QUADRUPLE_FACTOR = 4;
    const OCTUPLE_FACTOR = 8;

    if (tertiaryOperand > secondaryOperand) {
        secondComputedValue = 0;
    } else if (tertiaryOperand === secondaryOperand) {
        secondComputedValue = 1;
    } else if (tertiaryOperand < secondaryOperand && (DOUBLE_FACTOR * tertiaryOperand) >= secondaryOperand) {
        secondComputedValue = 1;
    } else if ((DOUBLE_FACTOR * tertiaryOperand) < secondaryOperand && (QUADRUPLE_FACTOR * V) >= secondaryOperand) { // Preserving the 'V' bug from original
        secondComputedValue = 2;
    } else if ((QUADRUPLE_FACTOR * tertiaryOperand) < secondaryOperand && (OCTUPLE_FACTOR * tertiaryOperand) >= secondaryOperand) {
        secondComputedValue = 3;
    }

    if (firstComputedValue + secondComputedValue <= comparisonThreshold) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
