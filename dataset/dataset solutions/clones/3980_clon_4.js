const processInputData = (rawText) => {
    const lines = rawText.trim().split('\n');
    const quantity = Number(lines[0]);
    const primaryElements = [];
    const secondaryElements = [];

    for (let k = 0; k < quantity; k++) {
        const [coordX, coordY] = lines[k + 1].split(' ').map(Number);
        primaryElements.push({ identifier: k, abscissa: coordX, ordinate: coordY });
    }
    for (let k = 0; k < quantity; k++) {
        const [coordX, coordY] = lines[k + quantity + 1].split(' ').map(Number);
        secondaryElements.push({ identifier: k, abscissa: coordX, ordinate: coordY });
    }
    return { totalItems: quantity, componentA: primaryElements, componentB: secondaryElements };
};

const establishInitialBindings = (componentA, componentB) => {
    const potentialCouplings = [];
    for (const elemA of componentA) {
        for (const elemB of componentB) {
            if (elemA.abscissa < elemB.abscissa && elemA.ordinate < elemB.ordinate) {
                potentialCouplings.push({ sourceIndex: elemA.identifier, targetIndex: elemB.identifier });
            }
        }
    }
    return potentialCouplings;
};

const performGreedyAssignment = (processedData) => {
    let currentMatchScore = 0;
    let availableSourceIndices = new Set(processedData.componentA.map(e => e.identifier));
    let availableTargetIndices = new Set(processedData.componentB.map(e => e.identifier));
    const allPossibleBindings = establishInitialBindings(processedData.componentA, processedData.componentB);

    let remainingPotentialConnections = allPossibleBindings.length;

    while (remainingPotentialConnections > 0 && availableSourceIndices.size > 0 && availableTargetIndices.size > 0) {
        const activeBindings = allPossibleBindings.filter(link =>
            availableSourceIndices.has(link.sourceIndex) && availableTargetIndices.has(link.targetIndex)
        );

        if (activeBindings.length === 0) {
            break;
        }

        const sourceEndpointDegrees = new Map();
        const targetEndpointDegrees = new Map();
        for (const link of activeBindings) {
            sourceEndpointDegrees.set(link.sourceIndex, (sourceEndpointDegrees.get(link.sourceIndex) || 0) + 1);
            targetEndpointDegrees.set(link.targetIndex, (targetEndpointDegrees.get(link.targetIndex) || 0) + 1);
        }

        let bestCandidateBinding = null;
        let minimalCombinedDegree = Infinity;

        for (const link of activeBindings) {
            const u = link.sourceIndex;
            const v = link.targetIndex;
            const currentSourceDegree = sourceEndpointDegrees.get(u) || 0;
            const currentTargetDegree = targetEndpointDegrees.get(v) || 0;
            const currentCombinedDegree = currentSourceDegree + currentTargetDegree;

            if (currentCombinedDegree < minimalCombinedDegree) {
                minimalCombinedDegree = currentCombinedDegree;
                bestCandidateBinding = link;
            }
        }

        if (bestCandidateBinding === null) {
            break;
        }

        currentMatchScore++;
        availableSourceIndices.delete(bestCandidateBinding.sourceIndex);
        availableTargetIndices.delete(bestCandidateBinding.targetIndex);

        remainingPotentialConnections -= (minimalCombinedDegree - 1);
    }
    return currentMatchScore;
};

const systemCoordinator = (rawInputContent) => {
    const initialData = processInputData(rawInputContent);
    return performGreedyAssignment(initialData);
};

console.log(systemCoordinator(require("fs").readFileSync("/dev/stdin", "utf8")));