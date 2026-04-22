const computeIntegralSpan = (dataStream) => {
    const segments = dataStream.split('\n').filter(Boolean);
    const rangeDescriptors = segments.slice(1);

    const tallyRecursiveSum = (remainingDescriptors, accumulatedValue) => {
        if (remainingDescriptors.length === 0) {
            return accumulatedValue;
        }

        const [currentDescriptor, ...subsequentDescriptors] = remainingDescriptors;
        const [beginValue, endValue] = currentDescriptor.split(' ').map(val => Number(val));

        const currentSpan = endValue - beginValue + 1;

        return tallyRecursiveSum(subsequentDescriptors, accumulatedValue + currentSpan);
    };

    const finalResult = tallyRecursiveSum(rangeDescriptors, 0);

    console.log(finalResult);
};

computeIntegralSpan(require("node:fs").readFileSync(process.stdin.fd, "utf8").trim());