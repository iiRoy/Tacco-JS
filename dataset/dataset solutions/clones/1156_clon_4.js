function runSystem(dataInput) {
    const lineSegments = dataInput.split('\n');
    const initialParameters = lineSegments[0].split(' ').map(Number);
    const entityCount = initialParameters[0];
    const queryCount = initialParameters[1];

    const lineage = Array.from({ length: entityCount }, (_, k) => k);
    const domainSize = Array.from({ length: entityCount }, () => 1);

    const discoverOrigin = (targetIndex) => {
        if (lineage[targetIndex] === targetIndex) {
            return targetIndex;
        }
        return discoverOrigin(lineage[targetIndex]);
    };

    const mergeDomains = (firstIndex, secondIndex) => {
        const rootOne = discoverOrigin(firstIndex);
        const rootTwo = discoverOrigin(secondIndex);

        if (rootOne === rootTwo) {
            return false;
        }

        if (domainSize[rootOne] < domainSize[rootTwo]) {
            lineage[rootOne] = rootTwo;
            domainSize[rootTwo] += domainSize[rootOne];
        } else {
            lineage[rootTwo] = rootOne;
            domainSize[rootOne] += domainSize[rootTwo];
        }
        return true;
    };

    const checkLinkage = (firstIndex, secondIndex) => {
        return discoverOrigin(firstIndex) === discoverOrigin(secondIndex) ? 1 : 0;
    };

    const resultAccumulator = [];

    for (let j = 0; j < queryCount; j++) {
        const currentInstruction = lineSegments[j + 1].split(' ').map(Number);
        const instructionType = currentInstruction[0];
        const primaryOperand = currentInstruction[1];
        const secondaryOperand = currentInstruction[2];

        if (instructionType === 0) {
            mergeDomains(primaryOperand, secondaryOperand);
        } else {
            resultAccumulator.push(checkLinkage(primaryOperand, secondaryOperand));
        }
    }

    console.log(resultAccumulator.join('\n'));
}

runSystem(require("node:fs").readFileSync(0, "utf8"));