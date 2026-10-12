const entryPoint = (rawData) => {
    const lineSegments = rawData.split("\n");
    const queryQuantity = Number(lineSegments[0]);

    const processQueryLine = (currentLine) => {
        const [firstValue, secondValue] = currentLine.split(" ").map(Number);
        const minimumValue = Math.min(firstValue, secondValue);
        const maximumValue = Math.max(firstValue, secondValue);

        const intermediateThreshold = Math.ceil(Math.sqrt(minimumValue * maximumValue)) - 1;

        const resultComponents = [];

        resultComponents.push((minimumValue - 1) * 2);

        if (minimumValue < maximumValue - 1) {
            resultComponents.push(1);
        }

        resultComponents.push(Math.max(intermediateThreshold - minimumValue, 0) * 2);

        if (Math.floor(minimumValue / intermediateThreshold * maximumValue) === intermediateThreshold) {
            resultComponents.push(-1);
        }

        return resultComponents.reduce((accumulatedSum, currentComponent) => accumulatedSum + currentComponent, 0);
    };

    lineSegments.slice(1, queryQuantity + 1).map(processQueryLine).forEach(console.log);
};

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
