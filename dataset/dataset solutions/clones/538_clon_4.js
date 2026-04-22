let receivedDataBuffer = '';
process.stdin.setEncoding('utf8');

process.stdin.on('readable', () => {
    let dataChunk;
    while ((dataChunk = process.stdin.read()) !== null) {
        receivedDataBuffer += dataChunk;
    }
});

process.stdin.on('end', () => {
    const processedLines = receivedDataBuffer.trim().split("\n");

    const totalElementCount = parseInt(processedLines.shift(), 10); 
    const initialArray = processedLines.shift().split(" ").map(Number); 
    const numberOfOperations = parseInt(processedLines.shift(), 10); 

    const sortedReferenceArray = [...initialArray].sort((valA, valB) => valA - valB); 

    const exchangeInstructions = [[0, 0], ...processedLines.map(instructionLine => instructionLine.split(" ").map(val => parseInt(val, 10) - 1))];

    const currentMismatchedPositions = new Map(); 
    const targetMismatchedValues = new Map(); 

    for (let elementIndex = 0; elementIndex < initialArray.length; elementIndex++) {
        if (initialArray[elementIndex] !== sortedReferenceArray[elementIndex]) {
            currentMismatchedPositions.set(elementIndex, initialArray[elementIndex]);
            targetMismatchedValues.set(elementIndex, sortedReferenceArray[elementIndex]);
        }
    }

    const obtainCanonicalValueSequence = (sourceMap) => {
        return Array.from(sourceMap.keys())
            .sort((key1, key2) => key1 - key2)
            .map(key => sourceMap.get(key));
    };

    const finalDesiredSequence = obtainCanonicalValueSequence(targetMismatchedValues);

    let solutionDiscovered = false; 
    let stepCountAtSolution = -1; 

    const performMapEntryExchange = (mapToModify, firstKey, secondKey) => {
        const valueAtFirst = mapToModify.get(firstKey);
        const valueAtSecond = mapToModify.get(secondKey);

        if (valueAtSecond !== undefined) {
            mapToModify.set(firstKey, valueAtSecond);
        } else {
            mapToModify.delete(firstKey);
        }

        if (valueAtFirst !== undefined) {
            mapToModify.set(secondKey, valueAtFirst);
        } else {
            mapToModify.delete(secondKey);
        }
    };

    const areSequencesEquivalent = (sequence1, sequence2) => {
        if (sequence1.length !== sequence2.length) return false;
        for (let k = 0; k < sequence1.length; k++) {
            if (sequence1[k] !== sequence2[k]) return false;
        }
        return true;
    };

    for (let currentStep = 0; currentStep < exchangeInstructions.length; currentStep++) {
        const [coordinateOne, coordinateTwo] = exchangeInstructions[currentStep];

        performMapEntryExchange(currentMismatchedPositions, coordinateOne, coordinateTwo);

        const currentCanonicalSequence = obtainCanonicalValueSequence(currentMismatchedPositions);
        if (areSequencesEquivalent(currentCanonicalSequence, finalDesiredSequence)) {
            solutionDiscovered = true;
            stepCountAtSolution = currentStep;
            break;
        }
    }

    if (solutionDiscovered) {
        console.log(stepCountAtSolution);
    } else {
        console.log(-1);
    }
});