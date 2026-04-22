class NumberProcessor {
    constructor(inputString) {
        this.sourceData = inputString;
    }

    extractNumericParameters() {
        const linesOfText = this.sourceData.trim().split(/\s*\n\s*/);
        const numericalSequence = linesOfText.flatMap(entry =>
            entry.split(/\s+/).map(token => BigInt(parseInt(token, 10)))
        );

        this.firstTimeParam = numericalSequence[0];
        this.secondTimeParam = numericalSequence[1];
        this.firstRateA = numericalSequence[2];
        this.secondRateA = numericalSequence[3];
        this.firstRateB = numericalSequence[4];
        this.secondRateB = numericalSequence[5];
    }

    performCoreCalculations() {
        const deltaA_first = this.firstRateA - this.firstRateB;
        const deltaA_second = this.secondRateA - this.secondRateB;

        const productOne = deltaA_first * this.firstTimeParam;
        const productTwo = deltaA_second * this.secondTimeParam;

        this.cumulativeDeltaOne = productOne;
        this.cumulativeDeltaTwo = productTwo + this.cumulativeDeltaOne;
    }

    determineFinalResult() {
        let outcomeIndicator;
        if (this.cumulativeDeltaTwo === 0n) {
            outcomeIndicator = 'infinity';
        } else if (this.cumulativeDeltaOne * this.cumulativeDeltaTwo < 0n) {
            // Original logic: d2 = d2 * -1n; tmp = (d1 / d2); ans = (tmp * d2 === d1) ? tmp * 2n : tmp * 2n + 1n;
            // This is equivalent to: (d1 / d2) * 2n + (d1 % d2 !== 0n ? 1n : 0n)
            // where d2 is first negated to ensure same sign for d1, d2 in the division context.
            const adjustedDivisor = this.cumulativeDeltaTwo * -1n;
            const integralQuotient = this.cumulativeDeltaOne / adjustedDivisor;
            const remainderCheck = this.cumulativeDeltaOne % adjustedDivisor;

            if (remainderCheck === 0n) {
                outcomeIndicator = integralQuotient * 2n;
            } else {
                outcomeIndicator = integralQuotient * 2n + 1n;
            }
        } else {
            outcomeIndicator = 0n;
        }
        return outcomeIndicator.toString();
    }
}

function processAndOutput(inputContent) {
    const dataProcessor = new NumberProcessor(inputContent);
    dataProcessor.extractNumericParameters();
    dataProcessor.performCoreCalculations();
    console.log(dataProcessor.determineFinalResult());
}

processAndOutput(require("fs").readFileSync("/dev/stdin", "utf8"));