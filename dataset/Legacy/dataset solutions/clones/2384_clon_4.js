function entryPoint(rawInput) {
    const parseNumericPairs = (textLine) => textLine.split(' ').slice(0, 2).map(Number);

    const structuredInput = rawInput.split('\n').map(parseNumericPairs);

    const timeFactors = structuredInput[0];
    const firstValues = structuredInput[1];
    const secondValues = structuredInput[2];

    const firstSegmentContribution = timeFactors[0] * (firstValues[0] - secondValues[0]);
    const totalContribution = firstSegmentContribution + timeFactors[1] * (firstValues[1] - secondValues[1]);

    const determineResult = (initialTerm, cumulativeTerm) => {
        if (cumulativeTerm === 0) {
            return 'infinity';
        }

        const evaluateFinalExpression = (numerator, denominator) => {
            if (numerator === 0) {
                return 0;
            }
            if (numerator * denominator > 0) {
                return 0;
            }

            const ratioValue = numerator / denominator;
            return Number.isInteger(ratioValue) ? (2 * ratioValue) : (-2 * Math.ceil(ratioValue) + 1);
        };

        return evaluateFinalExpression(initialTerm, cumulativeTerm);
    };

    console.log(determineResult(firstSegmentContribution, totalContribution));
}

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
