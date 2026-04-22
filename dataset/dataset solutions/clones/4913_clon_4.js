const processSequence = (sourceText) => {
    const allLines = sourceText.trim().split('\n');
    const numberOfSteps = Number(allLines[0]);

    const stepDataPairs = allLines.slice(1, numberOfSteps + 1).map(line => {
        const parts = line.split(' ');
        return [Number(parts[0]), Number(parts[1])];
    });

    const initialQuantities = { alpha: 1, beta: 1 };

    const finalQuantities = stepDataPairs.reduce((currentAccumulator, currentTargets) => {
        const currentAlpha = currentAccumulator.alpha;
        const currentBeta = currentAccumulator.beta;

        const targetBeta = currentTargets[0];
        const targetAlpha = currentTargets[1];

        const neededForBeta = Math.ceil(currentBeta / targetBeta);
        const neededForAlpha = Math.ceil(currentAlpha / targetAlpha);
        const commonMultiplier = Math.max(neededForBeta, neededForAlpha);

        const nextBeta = targetBeta * commonMultiplier;
        const nextAlpha = targetAlpha * commonMultiplier;

        return { alpha: nextAlpha, beta: nextBeta };
    }, initialQuantities);

    return finalQuantities.alpha + finalQuantities.beta;
};

console.log(processSequence(require("fs").readFileSync("/dev/stdin", "utf8")));