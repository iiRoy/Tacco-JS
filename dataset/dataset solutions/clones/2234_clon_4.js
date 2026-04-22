const solveProblem = (initialValues) => {
    const [alpha, beta, omega] = initialValues.map(Number);

    function* stateGenerator(initialAlpha, initialBeta, initialOmega) {
        let currentAlpha = initialAlpha;
        let currentBeta = initialBeta;
        let currentOmega = initialOmega;
        let currentSteps = 0;

        // The process continues as long as the quantity (omega) is positive.
        // Each iteration increments steps and modifies dimensions/quantity.
        while (currentOmega > 0) {
            if (currentAlpha > currentBeta) {
                currentBeta--;
                currentOmega -= currentAlpha;
            } else {
                currentAlpha--;
                currentOmega -= currentBeta;
            }
            currentSteps++;
            yield { currentAlpha, currentBeta, currentOmega, currentSteps };
        }
        // If initialOmega was already non-positive, yield the starting state with 0 steps
        if (initialOmega <= 0) {
            yield { currentAlpha: initialAlpha, currentBeta: initialBeta, currentOmega: initialOmega, currentSteps: 0 };
        }
    }

    let finalState = { currentSteps: 0 }; // Default to 0 steps if generator yields nothing (e.g., N was initially <= 0)
    for (const state of stateGenerator(alpha, beta, omega)) {
        finalState = state;
    }
    return finalState.currentSteps;
};

const processInputAndDisplay = (payload) => {
    const parsedData = payload.trim().split("\n");
    const calculatedOutcome = solveProblem(parsedData);
    console.log(calculatedOutcome);
};

processInputAndDisplay(require('fs').readFileSync('/dev/stdin', 'utf8'));