const obtainNumericSeries = (rawData) => rawData.trim().split('\n').map(Number);

const calculateResidueDifferences = (modulusValue) => {
    if (modulusValue === 1) {
        return [''];
    }

    const residueGeneration = (limit) => {
        return Array.from({ length: limit - 1 }, (_, k) => (k + 1) * (k + 1) % limit)
                    .reduce((accumulatorSet, currentSquare) => accumulatorSet.add(currentSquare), new Set());
    };
    const uniqueResidues = Array.from(residueGeneration(modulusValue));

    const determineCanonicalDelta = (firstComponent, secondComponent, currentMod) => {
        let deltaValue = (firstComponent - secondComponent + currentMod) % currentMod;
        const halfRangeLimit = Math.floor((currentMod - 1) / 2);
        return deltaValue > halfRangeLimit ? currentMod - deltaValue : deltaValue;
    };

    const deltaTally = uniqueResidues.flatMap((elementA, pIndex) =>
        uniqueResidues.slice(pIndex + 1).map(elementB =>
            determineCanonicalDelta(elementA, elementB, modulusValue)
        )
    ).reduce((countMap, canonicalDelta) => {
        countMap.set(canonicalDelta, (countMap.get(canonicalDelta) || 0) + 2);
        return countMap;
    }, new Map());

    const maxDeltaOutput = Math.floor((modulusValue - 1) / 2);
    const finalOutputs = Array.from({ length: maxDeltaOutput }, (_, deltaIndex) =>
        (deltaTally.get(deltaIndex + 1) || 0) * 2
    );
    return finalOutputs;
};

const executeProgram = (allInputs) => {
    let inputPointer = 0;
    while (true) {
        const currentInput = allInputs[inputPointer++];
        if (currentInput === 0) break;

        const results = calculateResidueDifferences(currentInput);
        results.forEach(outputValue => process.stdout.write(`${outputValue}\n`));
    }
};

let accumulatedData = '';
process.stdin.on('data', (inputChunk) => {
    accumulatedData += inputChunk;
});
process.stdin.on('end', () => {
    const parsedInputs = obtainNumericSeries(accumulatedData);
    executeProgram(parsedInputs);
});