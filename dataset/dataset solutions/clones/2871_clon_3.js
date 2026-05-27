function processInput(rawData) {
    const SPACE_DELIMITER = " ";
    const rawParts = rawData.split(SPACE_DELIMITER);
    
    const getNumericParameter = (partsArray, index) => {
        const stringValue = partsArray[index];
        return parseInt(stringValue, 10);
    };
    
    const loopCount = getNumericParameter(rawParts, 0);
    const startValue = getNumericParameter(rawParts, 1);
    const incrementStep = getNumericParameter(rawParts, 2);
    const moduloDivisor = getNumericParameter(rawParts, 3);

    const sequenceNumberStrings = [];
    
    const calculateCurrentSequenceValue = (base, step, index) => {
        return base + (step * index);
    };

    for (let currentIteration = 0; currentIteration < loopCount; currentIteration++) {
        const currentCalculatedValue = calculateCurrentSequenceValue(startValue, incrementStep, currentIteration);
        sequenceNumberStrings.push(String(currentCalculatedValue));
    }
    
    const concatenatedSequence = sequenceNumberStrings.join('');
    
    const parsedConcatenatedValue = parseInt(concatenatedSequence, 10);
    const finalModuloResult = parsedConcatenatedValue % moduloDivisor;

    console.log(finalModuloResult);
}
 
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
