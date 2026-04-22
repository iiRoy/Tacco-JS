const executeGeometricAnalysis = (rawDataString) => {
    const textRows = rawDataString.trim().split('\n');
    const pointQuantity = Number(textRows[0]);

    const geometricElements = textRows.slice(1, pointQuantity + 1).map(rowText => {
        const [hVal, vVal] = rowText.split(' ').map(Number);
        return { hPos: hVal, vPos: vVal };
    });

    const orderedElements = [...geometricElements].sort((elementA, elementB) => {
        if (elementA.hPos === elementB.hPos) {
            return elementA.vPos - elementB.vPos;
        }
        return elementA.hPos - elementB.hPos;
    });

    const displacementTally = new Map();

    orderedElements.forEach((sourceElement, sourceIndex) => {
        orderedElements.forEach((targetElement, targetIndex) => {
            if (sourceIndex === targetIndex) return;

            const horizontalShift = sourceElement.hPos - targetElement.hPos;
            const verticalShift = sourceElement.vPos - targetElement.vPos;
            const displacementSignature = `${horizontalShift},${verticalShift}`;

            displacementTally.set(displacementSignature, (displacementTally.get(displacementSignature) || 0) + 1);
        });
    });

    let highestTally = 0;
    let principalDisplacementSignature = null;

    for (const [signature, count] of displacementTally.entries()) {
        if (count > highestTally) {
            highestTally = count;
            principalDisplacementSignature = signature;
        }
    }

    const [principalHorizontalShift, principalVerticalShift] = principalDisplacementSignature.split(',').map(Number);
    const dominantVector = { phs: principalHorizontalShift, pvs: principalVerticalShift };

    const verifyAlignment = (firstPoint, secondPoint, vectorH, vectorV) => {
        const deltaH = secondPoint.hPos - firstPoint.hPos;
        const deltaV = secondPoint.vPos - firstPoint.vPos;

        const hCheck = (vectorH === 0) ? (deltaH === 0) : (deltaH % vectorH === 0);
        const vCheck = (vectorV === 0) ? (deltaV === 0) : (deltaV % vectorV === 0);

        return hCheck && vCheck;
    };

    const computeCoverage = (remainingElements, currentDominantVector, currentPathCount = 0) => {
        if (remainingElements.length === 0) {
            return currentPathCount;
        }

        const pathOrigin = remainingElements[0];
        const { phs, pvs } = currentDominantVector;

        const subsequentElements = remainingElements.filter(element =>
            !verifyAlignment(pathOrigin, element, phs, pvs)
        );

        return computeCoverage(subsequentElements, currentDominantVector, currentPathCount + 1);
    };

    const minimumPasses = computeCoverage(orderedElements, dominantVector);

    console.log(minimumPasses);
};

executeGeometricAnalysis(require("fs").readFileSync("/dev/stdin", "utf8"));