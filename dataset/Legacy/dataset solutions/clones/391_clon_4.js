const fileSystem = require('fs');

const parseAndFilterInput = (rawInputContent) => {
    const numericEntries = rawInputContent.trim().split('\n').filter(Boolean).map(Number);
    const zeroMarkerIndex = numericEntries.indexOf(0);
    return zeroMarkerIndex === -1 ? numericEntries : numericEntries.slice(0, zeroMarkerIndex);
};

const determineQuadraticResidues = (modulusValue) => {
    const uniqueResidues = new Set();
    for (let currentFactor = 1; currentFactor < modulusValue; currentFactor++) {
        uniqueResidues.add((currentFactor * currentFactor) % modulusValue);
    }
    return Array.from(uniqueResidues).sort((a, b) => a - b);
};

const tabulateCircularDistances = (modulus, residueCollection) => {
    const maximumDistance = Math.floor((modulus - 1) / 2);
    const distanceAccumulator = Array.from({ length: maximumDistance + 1 }, () => 0);

    const residueCombinations = residueCollection.flatMap((elementA, indexA) =>
        residueCollection.slice(indexA + 1).map(elementB => [elementA, elementB])
    );

    residueCombinations.forEach(([firstElement, secondElement]) => {
        const absoluteDifference = Math.abs(firstElement - secondElement);
        const effectiveCircularDistance = Math.min(absoluteDifference, modulus - absoluteDifference);
        distanceAccumulator[effectiveCircularDistance] += 2;
    });

    return distanceAccumulator;
};

const executeProcessing = () => {
    const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
    const numbersForCalculation = parseAndFilterInput(rawData);

    numbersForCalculation.forEach(currentModulus => {
        const quadraticResidueList = determineQuadraticResidues(currentModulus);
        const computedDistances = tabulateCircularDistances(currentModulus, quadraticResidueList);
        computedDistances.slice(1).forEach(distanceCount => console.log(distanceCount));
    });
};

executeProcessing();
