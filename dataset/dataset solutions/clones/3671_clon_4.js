const processProblemSet = (rawInputContent) => {
    const dataLines = rawInputContent.split(/\r?\n/);
    const numberOfTestCases = Number.parseInt(dataLines[0]);
    const outcomes = [];

    const calculateOutcomeForCase = (initialValue, stepValue, thresholdValue, incrementValue) => {
        if (initialValue < stepValue) return "No";
        if (incrementValue < stepValue) return "No";
        if (initialValue < thresholdValue) return "Yes";

        const traversePath = (currentPosition, visitedPositions) => {
            if (currentPosition >= initialValue) {
                return "Yes";
            }
            if (currentPosition < stepValue) {
                return "No";
            }
            if (visitedPositions.has(currentPosition)) {
                return "No";
            }

            visitedPositions.add(currentPosition);

            const remainingAfterStep = currentPosition - stepValue;
            let nextPosition;

            if (remainingAfterStep <= thresholdValue) {
                nextPosition = remainingAfterStep + incrementValue;
            } else {
                nextPosition = remainingAfterStep;
            }

            return traversePath(nextPosition, visitedPositions);
        };

        const startPosition = (initialValue % stepValue) + stepValue;
        return traversePath(startPosition, new Set());
    };

    for (let testIndex = 1; testIndex <= numberOfTestCases; ++testIndex) {
        const parameters = dataLines[testIndex].split(' ').map(Number.parseInt);
        const [p0, p1, p2, p3] = parameters;
        outcomes.push(calculateOutcomeForCase(p0, p1, p2, p3));
    }

    outcomes.forEach(result => console.log(result));
};

const obtainInputAndExecute = (inputSource) => {
    const fileModule = require('fs');
    const fileContent = fileModule.readFileSync(inputSource, 'utf8');
    processProblemSet(fileContent);
};

obtainInputAndExecute('/dev/stdin');