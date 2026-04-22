const calculateSpanTotal = (allTextContent) => {
    const contentLines = allTextContent.split('\n');

    const recursiveSum = (indexPosition, accumulatedValue) => {
        if (indexPosition >= contentLines.length) {
            return accumulatedValue;
        }

        const currentSegment = contentLines[indexPosition].trim();
        if (currentSegment.length === 0) {
            return recursiveSum(indexPosition + 1, accumulatedValue);
        }

        const parts = currentSegment.match(/\d+/g);
        let lineContribution = 0;
        if (parts && parts.length >= 2) {
            const valA = Number(parts[0]);
            const valB = Number(parts[1]);
            lineContribution = (valB - valA + 1);
        }

        return recursiveSum(indexPosition + 1, accumulatedValue + lineContribution);
    };

    // Begin the recursive calculation from the second line (index 1), skipping the first.
    return recursiveSum(1, 0).toString();
};

const executeComputationalFlow = (dataInputSource) => {
    const entireContent = dataInputSource.toString();
    const finalOutcome = calculateSpanTotal(entireContent);
    process.stdout.write(finalOutcome + '\n');
};

const acquirePayload = () => {
    return require("node:fs").readFileSync("/dev/stdin", "utf8");
};

executeComputationalFlow(acquirePayload());