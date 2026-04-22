let storedData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (incomingSegment) => {
    storedData += incomingSegment;
});

process.stdin.on('end', () => {
    const rawInputLines = storedData.split('\n');

    // Remove empty strings from the array of lines, mirroring original behavior
    const processedLines = rawInputLines.filter(lineContent => lineContent !== '');

    // Parse the first line as the numerical count for processing
    const itemCount = Number(processedLines[0]);

    // Determine the array of number strings from the second line
    let numberStrings;
    if (processedLines[1] === undefined) {
        // If the second line is missing, treat it as an empty array of number strings
        numberStrings = [];
    } else {
        numberStrings = processedLines[1].split(' ');
    }
    
    // Create a complete sequence of numbers to be processed, matching the original's behavior
    // This includes converting empty strings to 0 and undefined values to NaN
    const fullProcessingSequence = [];
    for (let currentIdx = 0; currentIdx < itemCount; currentIdx++) {
        fullProcessingSequence.push(Number(numberStrings[currentIdx]));
    }

    // Initialize result container with NaN, reflecting potential initial NaN values
    let finalMetrics = { smallestVal: NaN, largestVal: NaN, totalSum: NaN };

    // If there's at least one element in the sequence, initialize metrics with the first element
    if (fullProcessingSequence.length > 0) {
        finalMetrics.smallestVal = fullProcessingSequence[0];
        finalMetrics.largestVal = fullProcessingSequence[0];
        finalMetrics.totalSum = fullProcessingSequence[0];
    }

    // Use reduce to iterate over the remaining elements (from the second element onwards)
    // and update min, max, and sum according to original logic
    const computedMetrics = fullProcessingSequence.slice(1).reduce((accumulator, currentValue) => {
        const valueToProcess = currentValue;
        
        // Update minimum if current value is smaller and not NaN (NaN comparison is always false)
        if (accumulator.smallestVal > valueToProcess) {
            accumulator.smallestVal = valueToProcess;
        }
        
        // Update maximum if current value is larger and not NaN
        if (accumulator.largestVal < valueToProcess) {
            accumulator.largestVal = valueToProcess;
        }
        
        // Summation: NaN propagates if any operand is NaN
        accumulator.totalSum += valueToProcess;
        
        return accumulator;
    }, finalMetrics); // Start reduction with the initial metrics

    // Print the final calculated values
    console.log(computedMetrics.smallestVal + ' ' + computedMetrics.largestVal + ' ' + computedMetrics.totalSum);
});