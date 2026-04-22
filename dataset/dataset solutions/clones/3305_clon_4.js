const solveOptimization = (sourceMaterial) => {
    const componentLines = sourceMaterial.split('\n');
    const systemParameters = componentLines.shift().split(' ').map(Number);
    const elementCount = systemParameters[0];
    const weightCapacity = systemParameters[1];
    const availableElements = componentLines.map(line => line.split(' ').map(Number));

    const primeElement = availableElements.shift();
    const primeElementWeight = primeElement[0];
    const primeElementValue = primeElement[1];

    const valueToWeightMap = new Map();
    valueToWeightMap.set(0, 0);

    let maximumAchievableValue = primeElementValue;

    Array.from({ length: primeElementValue }, (_, idx) => idx + 1)
        .forEach(v => valueToWeightMap.set(v, primeElementWeight));

    availableElements.forEach(currentElement => {
        const currentElementWeight = currentElement[0];
        const currentElementValue = currentElement[1];
        maximumAchievableValue += currentElementValue;

        const iterationValues = Array.from({ length: maximumAchievableValue }, (_, idx) => maximumAchievableValue - idx);

        iterationValues.forEach(targetVal => {
            const existingMinWeight = valueToWeightMap.get(targetVal);

            if (targetVal >= currentElementValue) {
                const requiredPrevVal = targetVal - currentElementValue;
                const weightForRequiredPrevVal = valueToWeightMap.get(requiredPrevVal);

                if (weightForRequiredPrevVal !== undefined) {
                    const potentialNewWeight = weightForRequiredPrevVal + currentElementWeight;
                    if (existingMinWeight === undefined || potentialNewWeight < existingMinWeight) {
                        valueToWeightMap.set(targetVal, potentialNewWeight);
                    }
                }
            } else {
                if (existingMinWeight === undefined || currentElementWeight < existingMinWeight) {
                    valueToWeightMap.set(targetVal, currentElementWeight);
                }
            }
        });
    });

    const ultimateValue = Array.from({ length: maximumAchievableValue + 1 }, (_, idx) => maximumAchievableValue - idx)
        .find(potentialVal => {
            const requiredWeight = valueToWeightMap.get(potentialVal);
            return requiredWeight !== undefined && requiredWeight <= weightCapacity;
        });

    console.log((ultimateValue || 0) + 0);
};

solveOptimization(require('fs').readFileSync('/dev/stdin', 'utf8'));