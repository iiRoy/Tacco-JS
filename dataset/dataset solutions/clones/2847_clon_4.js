const processInputData = (rawData) => {
    const lines = rawData.trim().split('\n');
    // The first line contains N, but it's not explicitly used beyond defining the array length.
    // We only need the numeric values from the second line.
    const numberCollection = lines[1].split(' ').map(parseInt);
    return numberCollection;
};

const performCalculations = (inputNumbers) => {
    // Sort the numbers in descending order, mimicking the original's initial sort.
    const sortedValues = [...inputNumbers].sort((x, y) => y - x);

    // Find the index of the first negative number. This replaces the binary search.
    const firstNegativeBoundary = sortedValues.findIndex(val => val < 0);
    // If no negative numbers, the boundary is at the end of the array.
    const splitPoint = (firstNegativeBoundary === -1) ? sortedValues.length : firstNegativeBoundary;

    // Extract the key values and segments based on the split point.
    // 'leadValue' corresponds to A[0]
    const leadValue = sortedValues[0];
    // 'tailValue' corresponds to A[A.length-1]
    const tailValue = sortedValues[sortedValues.length - 1];

    // 'midPositiveNumbers' corresponds to A.slice(1, r)
    const midPositiveNumbers = sortedValues.slice(1, splitPoint);
    // 'midNegativeNumbers' corresponds to A.slice(r, A.length-1)
    const midNegativeNumbers = sortedValues.slice(splitPoint, sortedValues.length - 1);

    // To match the `pop()` behavior of the original, these segments need to be processed in reverse.
    const reversedMidPositives = [...midPositiveNumbers].reverse();
    const reversedMidNegatives = [...midNegativeNumbers].reverse();

    // Phase 1: Process `midPositiveNumbers` (B in original) against `tailValue` (c in original).
    // Uses a functional reducer approach to build the operations trace.
    const phaseOneState = reversedMidPositives.reduce((accumulator, currentElement) => {
        accumulator.operationLog.push(`${accumulator.currentAccumulator} ${currentElement}`);
        accumulator.currentAccumulator -= currentElement;
        return accumulator;
    }, { currentAccumulator: tailValue, operationLog: [] });

    // Phase 2: Main subtraction, `leadValue` (b in original) minus the result of Phase 1.
    const phaseTwoAccumulator = leadValue - phaseOneState.currentAccumulator;
    phaseOneState.operationLog.push(`${leadValue} ${phaseOneState.currentAccumulator}`);

    // Phase 3: Process `midNegativeNumbers` (C in original) against the result of Phase 2.
    const finalState = reversedMidNegatives.reduce((accumulator, currentElement) => {
        accumulator.operationLog.push(`${accumulator.currentAccumulator} ${currentElement}`);
        accumulator.currentAccumulator -= currentElement;
        return accumulator;
    }, { currentAccumulator: phaseTwoAccumulator, operationLog: phaseOneState.operationLog });

    return { finalOutcome: finalState.currentAccumulator, sequenceOfOperations: finalState.operationLog };
};

const executeProgram = (inputFilePath) => {
    const fileContent = require('fs').readFileSync(inputFilePath, 'utf8');
    const parsedNumbers = processInputData(fileContent);
    const computationResult = performCalculations(parsedNumbers);
    return `${computationResult.finalOutcome}\n${computationResult.sequenceOfOperations.join('\n')}`;
};

console.log(executeProgram('/dev/stdin'));