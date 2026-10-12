const processInput = (rawContent) => {
    const dataLines = rawContent.split('\n');
    const totalCases = parseInt(dataLines[0], 10);

    const determineOutcome = (initialValueA, paramB, paramC, paramD) => {
        if (initialValueA < paramB) {
            return "No";
        }
        if (paramD < paramB) {
            return "No";
        }
        if (initialValueA < paramC) {
            return "Yes";
        }

        let currentIterationValue = (initialValueA % paramB) + paramB;
        const visitedStates = new Set();

        const simulateStep = (currentVal) => {
            if (currentVal >= 2 * initialValueA || currentVal === initialValueA) {
                return true;
            }
            if (currentVal < paramB) {
                return false;
            }
            if (visitedStates.has(currentVal)) {
                return false;
            }
            visitedStates.add(currentVal);

            const nextVal = (currentVal - paramB) <= paramC
                ? (currentVal - paramB + paramD)
                : (currentVal - paramB);

            return simulateStep(nextVal);
        };

        return simulateStep(currentIterationValue) ? "Yes" : "No";
    };

    const caseResults = dataLines.slice(1, totalCases + 1).map(line => {
        const [valA, valB, valC, valD] = line.split(' ').map(Number);
        return determineOutcome(valA, valB, valC, valD);
    });

    console.log(caseResults.join('\n'));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
