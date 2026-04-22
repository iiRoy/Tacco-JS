function ProcessSequence(rawInputData) {
    const inputLines = rawInputData.split("\n");
    const sequenceLength = Number(inputLines[0]);
    const characterStream = Array.from(inputLines[1]);

    const deriveGroupedLengths = (stream, totalNominalLength) => {
        const structuralGroups = stream.reduce((accumulator, currentMark, currentPosition) => {
            if (currentPosition === 0) {
                accumulator.push({ form: currentMark, extent: 1 });
            } else {
                const previousGroup = accumulator[accumulator.length - 1];
                if (currentMark === previousGroup.form) {
                    previousGroup.extent++;
                } else {
                    accumulator.push({ form: currentMark, extent: 1 });
                }
            }
            return accumulator;
        }, []);

        const dimensionalVector = Array(totalNominalLength + 1).fill(0);
        let vectorStartOffset = 0;
        if (structuralGroups.length > 0 && structuralGroups[0].form === ')') {
            vectorStartOffset = 1;
        }

        structuralGroups.forEach((group, groupIndex) => {
            dimensionalVector[vectorStartOffset + groupIndex] = group.extent;
        });
        return dimensionalVector;
    };

    let blockQuantities = deriveGroupedLengths(characterStream, sequenceLength);

    const calculateNetBalance = (quantities, limit) => {
        let totalNet = 0;
        for (let x = 0; x < limit; x += 2) {
            totalNet += (quantities[x] - quantities[x + 1]);
        }
        return totalNet;
    };

    let cumulativeBalance = calculateNetBalance(blockQuantities, sequenceLength);
    const initialSegmentDifference = blockQuantities[0] - blockQuantities[1];

    const findLastSignificantIndex = (arr) => {
        for (let y = arr.length - 1; y >= 0; y--) {
            if (arr[y] > 0) return y;
        }
        return -1;
    };

    const applyBalancingLogic = (currentQuantities, balanceValue, firstPairDiff, totalSize) => {
        const alteredQuantities = [...currentQuantities]; 
        const lastPresentIndex = findLastSignificantIndex(alteredQuantities);

        if (balanceValue < 0) {
            alteredQuantities[0] -= balanceValue; 
        } else if (balanceValue > 0) {
            if (lastPresentIndex % 2 === 0) { 
                alteredQuantities[lastPresentIndex + 1] += balanceValue;
            } else { 
                alteredQuantities[lastPresentIndex] += balanceValue;
            }
        } else if (firstPairDiff < 0) { 
            const requiredAdjustment = alteredQuantities[1] - alteredQuantities[0];
            alteredQuantities[0] = alteredQuantities[1];

            if (lastPresentIndex % 2 === 0) { 
                alteredQuantities[lastPresentIndex + 1] = alteredQuantities[lastPresentIndex];
            } else { 
                alteredQuantities[lastPresentIndex] += requiredAdjustment;
            }
        }
        return alteredQuantities;
    };

    blockQuantities = applyBalancingLogic(blockQuantities, cumulativeBalance, initialSegmentDifference, sequenceLength);

    const constructFinalRepresentation = (processedQuantities, totalSize) => {
        let assembledParts = [];
        for (let z = 0; z < totalSize; z++) {
            if (processedQuantities[z] > 0) {
                const symbol = (z % 2 === 0) ? '(' : ')';
                assembledParts.push(symbol.repeat(processedQuantities[z]));
            }
        }
        return assembledParts.join('');
    };

    const finalOutputString = constructFinalRepresentation(blockQuantities, sequenceLength);
    console.log(finalOutputString);
}

ProcessSequence(require("fs").readFileSync("/dev/stdin", "utf8"));