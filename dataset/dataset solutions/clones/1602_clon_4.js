function ExecuteCalculation(dataString) {
    const numericalElements = dataString.split(/\s+/).filter(Boolean).map(Number);

    const initialValue = numericalElements[0];
    const totalStepCount = numericalElements[1];
    const stepMagnitude = numericalElements[2];

    const optimalDisplacementFloat = -initialValue / stepMagnitude;

    const candidateDisplacements = new Set();
    candidateDisplacements.add(Math.floor(optimalDisplacementFloat));
    candidateDisplacements.add(Math.ceil(optimalDisplacementFloat));
    candidateDisplacements.add(Math.floor(optimalDisplacementFloat) - 1);
    candidateDisplacements.add(Math.floor(optimalDisplacementFloat) + 1);
    candidateDisplacements.add(Math.ceil(optimalDisplacementFloat) - 1);
    candidateDisplplacements.add(Math.ceil(optimalDisplacementFloat) + 1);

    let minimumAbsoluteOutcome = Infinity;

    for (const currentDisplacement of candidateDisplacements) {
        const absoluteDisplacement = Math.abs(currentDisplacement);

        const remainingPathSteps = totalStepCount - absoluteDisplacement;

        if (absoluteDisplacement <= totalStepCount && remainingPathSteps % 2 === 0) {
            const currentOutcome = Math.abs(initialValue + currentDisplacement * stepMagnitude);
            if (currentOutcome < minimumAbsoluteOutcome) {
                minimumAbsoluteOutcome = currentOutcome;
            }
        }
    }

    console.log(minimumAbsoluteOutcome);
}

ExecuteCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));