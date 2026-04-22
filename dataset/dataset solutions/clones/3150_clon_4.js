const processSourceData = (sourceData) => {
    const numericElements = sourceData.match(/[-+]?([0-9]*\.[0-9]+|[0-9]+)/g).map(parseFloat);

    const firstQuantity = numericElements[0];
    const secondQuantity = numericElements[1];
    const limitingFactor = numericElements[2];

    const deriveIntermediateValue = (q1, q2) => {
        if (q1 > q2) {
            return 0;
        } else {
            return q2 / q1;
        }
    };

    const determineFinalOutcome = (interimVal, limit) => {
        if (interimVal >= limit) {
            return limit;
        } else {
            return Math.floor(interimVal);
        }
    };

    const intermediateResult = deriveIntermediateValue(firstQuantity, secondQuantity);
    const ultimateResult = determineFinalOutcome(intermediateResult, limitingFactor);

    process.stdout.write(ultimateResult.toString() + '\n');
};

const rawInputContent = Buffer.from(require('node:fs').readFileSync(0)).toString('utf8');
processSourceData(rawInputContent);