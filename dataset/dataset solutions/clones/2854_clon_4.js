const processInputAndCompute = (rawSource) => {
    const numericComponents = rawSource.split(/\s+/).map(Number);

    const [firstTerm, secondTerm, thirdTerm] = numericComponents;

    const aggregateSums = [
        firstTerm + secondTerm,
        secondTerm + thirdTerm,
        thirdTerm + firstTerm
    ];

    const smallestAggregation = aggregateSums.reduce((currentMin, currentVal) => {
        return currentVal < currentMin ? currentVal : currentMin;
    }, aggregateSums[0]);

    console.log(smallestAggregation);
};

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));