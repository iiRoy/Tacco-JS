const processAllCases = (inputText) => {
    const dataLines = inputText.split('\n');
    const totalCases = Number(dataLines[0]);
    const outcomes = [];

    for (let caseIterator = 0; caseIterator < totalCases; caseIterator++) {
        const numericInputs = dataLines[caseIterator + 1].split(' ').map(Number);
        const smallerValue = Math.min(numericInputs[0], numericInputs[1]);
        const largerValue = Math.max(numericInputs[0], numericInputs[1]);

        outcomes.push(determineResult(smallerValue, largerValue));
    }
    return outcomes.join('\n');
};

const determineResult = (firstOperand, secondOperand) => {
    const productOfOperands = firstOperand * secondOperand;
    let computedValue = 0;

    // Part 1: Contribution from values less than firstOperand
    // Original: (a - 1) * 2
    if (firstOperand > 0) {
        computedValue += 2 * (firstOperand - 1);
    }

    // Part 2: Conditional contribution based on relative size
    // Original: if (a < b - 1) ans++;
    if (firstOperand < secondOperand - 1) {
        computedValue += 1;
    }

    // Part 3: Contribution from values between firstOperand and sqrt(product)
    // This part replaces the original's 'for' loop with a closed-form calculation
    // Original loop upper bound: c = Math.ceil(Math.sqrt(a * b)); loop runs j < c
    // Equivalent to j <= Math.ceil(Math.sqrt(a*b)) - 1
    // Which is equivalent to j <= Math.floor(Math.sqrt(a*b - 1))
    const upperLimitForIteration = Math.floor(Math.sqrt(productOfOperands - 1));

    if (firstOperand + 1 <= upperLimitForIteration) {
        // The original loop condition: Math.floor(a / j * b) === j
        // is equivalent to j*j <= productOfOperands < j*(j+1)
        // This means j*(j+1) > productOfOperands will add 1, otherwise add 2.
        // We find the largest integer j_prime such that j_prime*(j_prime+1) <= productOfOperands.
        // This is equivalent to j_prime^2 + j_prime - productOfOperands <= 0.
        // Using the quadratic formula, the positive root of j^2 + j - productOfOperands = 0 is (-1 + sqrt(1 + 4*productOfOperands)) / 2.
        // So, crossoverPoint is floor of this root.
        const crossoverPoint = Math.floor((-1 + Math.sqrt(1 + 4 * productOfOperands)) / 2);

        const loopStartEquivalent = firstOperand + 1;
        const loopEndEquivalent = upperLimitForIteration;

        let doubleIncrementCount = 0; // For j where j*(j+1) <= productOfOperands
        let singleIncrementCount = 0; // For j where j*(j+1) > productOfOperands

        if (loopStartEquivalent > crossoverPoint) {
            // All values in the range [loopStartEquivalent, loopEndEquivalent] result in single increment
            singleIncrementCount = loopEndEquivalent - loopStartEquivalent + 1;
        } else if (loopEndEquivalent <= crossoverPoint) {
            // All values in the range [loopStartEquivalent, loopEndEquivalent] result in double increment
            doubleIncrementCount = loopEndEquivalent - loopStartEquivalent + 1;
        } else {
            // The range spans across the crossoverPoint
            doubleIncrementCount = crossoverPoint - loopStartEquivalent + 1;
            singleIncrementCount = loopEndEquivalent - (crossoverPoint + 1) + 1;
        }
        computedValue += (2 * doubleIncrementCount) + (1 * singleIncrementCount);
    }
    return computedValue;
};

// Input/Output handling, different from original's Main function
const standardInput = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(processAllCases(standardInput));