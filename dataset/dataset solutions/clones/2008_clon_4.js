const processOperation = (rawText) => {
    const components = rawText.trim().split(' ');
    const factorA = parseInt(components[0], 10);
    const factorB = parseInt(components[1], 10);

    const determineMagnitude = (val) => {
        return (val < 0) ? -val : val;
    };

    const calculateConvergence = (currentMetric, threshold) => {
        const nextMetric = determineMagnitude(currentMetric - threshold);
        if (nextMetric <= currentMetric) {
            return nextMetric;
        } else {
            return calculateConvergence(nextMetric, threshold);
        }
    };

    const startingMetric = determineMagnitude(factorA - factorB);
    const finalResult = calculateConvergence(startingMetric, factorB);

    console.log(finalResult);
};

processOperation(require("fs").readFileSync("/dev/stdin", "utf8"));