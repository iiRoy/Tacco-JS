function countSetBits(numericalValue) {
    let activeBits = 0;
    let tempValue = numericalValue;
    while (tempValue > 0) {
        tempValue &= (tempValue - 1);
        activeBits++;
    }
    return activeBits;
}

function determineStepsToZero(startingValue) {
    let currentProcessingValue = startingValue;
    let iterationCounter = 0;

    if (currentProcessingValue === 0) {
        return 0;
    }

    while (currentProcessingValue !== 0) {
        const setBitsInCurrent = countSetBits(currentProcessingValue);
        currentProcessingValue %= setBitsInCurrent;
        iterationCounter++;
    }
    return iterationCounter;
}

function processBinaryTransformations(sourceContent) {
    const contentLines = sourceContent.split('\n');
    const transformationCount = Number(contentLines[0]);
    const initialBinaryPattern = contentLines[1];

    for (let currentPosition = 0; currentPosition < transformationCount; currentPosition++) {
        const currentBinaryChars = initialBinaryPattern.split('');
        
        currentBinaryChars[currentPosition] = (initialBinaryPattern[currentPosition] === '1' ? '0' : '1');
        
        const modifiedBinaryPattern = currentBinaryChars.join('');
        
        const decimalRepresentation = parseInt(modifiedBinaryPattern, 2);
        
        console.log(determineStepsToZero(decimalRepresentation));
    }
}

processBinaryTransformations(require("fs").readFileSync("/dev/stdin", "utf8"));