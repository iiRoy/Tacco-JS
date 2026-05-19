const processInput = (rawText) => {
    const lines = rawText.split('\n');

    const [timeFactors, factorA, factorB] = lines.map(line =>
        line.split(' ').map(Number)
    );

    const [t0, t1] = timeFactors;
    const [a0, a1] = factorA;
    const [b0, b1] = factorB;

    const cumulativeEffects = [
        t0 * (a0 - b0),
        t1 * (a1 - b1)
    ];

    if (cumulativeEffects[0] + cumulativeEffects[1] === 0) {
        console.log('infinity');
        return;
    }

    const determineConvergenceStep = (currentTotal, previousTotal, stepCounter) => {
        if (currentTotal * previousTotal > 0) {
            return stepCounter - 1;
        }

        const nextEffectComponent = cumulativeEffects[stepCounter % 2];
        const nextCurrentTotal = currentTotal + nextEffectComponent;

        return determineConvergenceStep(nextCurrentTotal, currentTotal, stepCounter + 1);
    };

    console.log(determineConvergenceStep(0, 1, 0));
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
