const processInputData = () => {
    const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const numericalTokens = rawInputContent.trim().split(/\s+/).map(Number);

    const parameterAlpha = numericalTokens[0];
    const parameterBeta = numericalTokens[1];
    const parameterGamma = numericalTokens[2];

    const calculateGCD = (valueOne, valueTwo) => {
        valueOne = Math.abs(valueOne);
        valueTwo = Math.abs(valueTwo);
        const recursiveGCD = (n1, n2) => (n2 === 0) ? n1 : recursiveGCD(n2, n1 % n2);
        return recursiveGCD(valueOne, valueTwo);
    };

    const remainderOfAlpha = parameterAlpha % parameterBeta;

    let finalOutcome = false;

    if (remainderOfAlpha === 0) {
        // If (alpha % beta) is 0, then (alpha * i) % beta will always be 0.
        // Thus, gamma must be 0 for a match.
        finalOutcome = (parameterGamma === 0);
    } else {
        // If (alpha % beta) is not 0
        const commonDivisorValue = calculateGCD(remainderOfAlpha, parameterBeta);

        // Condition 1: parameterGamma must be a multiple of the common divisor.
        const isDivisible = (parameterGamma % commonDivisorValue === 0);

        // Condition 2: parameterGamma must have the same sign as remainderOfAlpha (or be 0).
        // This is due to JavaScript's % operator behavior.
        const hasConsistentSign = (Math.sign(parameterGamma) === Math.sign(remainderOfAlpha) || parameterGamma === 0);

        // Condition 3: The absolute value of parameterGamma must be less than parameterBeta,
        // because (X * i) % Y always results in a value whose absolute value is less than Y.
        const isWithinBounds = (Math.abs(parameterGamma) < parameterBeta);

        finalOutcome = isDivisible && hasConsistentSign && isWithinBounds;
    }

    process.stdout.write(finalOutcome ? "YES" : "NO");
};

processInputData();