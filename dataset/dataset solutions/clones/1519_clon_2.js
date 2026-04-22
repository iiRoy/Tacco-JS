const processInput = ( inputString ) => {
    const [ countLimit, startValue, modulus ] = inputString.split(' ').map(Number);

    let sequenceValues = Array.from({length: modulus}, () => 0 );
    let seenIndices = new Array(modulus).fill(0);
    sequenceValues[0] = startValue;
    seenIndices[0] = startValue;
    // Initializing the sequence and tracking seen values

    let idx = 1;
    let cycleStartIdx = 0;
    for ( ; idx < modulus; idx++ ) {
        sequenceValues[idx] = ( sequenceValues[idx-1] * sequenceValues[idx-1] ) % modulus;
        if ( seenIndices[sequenceValues[idx]] !== 0 ) {
            // A repetition in the sequence has been found
            cycleStartIdx = seenIndices[sequenceValues[idx]];
            break;
        } else { /* No repetition yet, record current value's index */
            seenIndices[sequenceValues[idx]] = idx;
        }
    }
    const cycleEndIdx = idx;
    const cycleLength = cycleEndIdx - cycleStartIdx;
    const numFullCycles = (cycleLength === 0) ? 0 : Math.floor( (countLimit - cycleStartIdx) / cycleLength );
    // Calculating cycle properties

    let totalSum = 0;
    let sumOfCycleElements = 0;
    for ( idx = cycleStartIdx; idx < cycleEndIdx; idx++ ) {
        sumOfCycleElements += sequenceValues[idx];
    }
    totalSum += sumOfCycleElements * numFullCycles;

    // Accumulate values occurring before the cycle begins
    for ( idx = 0; idx < cycleStartIdx; idx++ ) {
        totalSum += sequenceValues[idx];
    }

    // Calculate and add the sum of any remaining elements after full cycles
    const remainingElementsCount = (cycleLength === 0) ? 0 : ( countLimit - cycleStartIdx - (cycleLength * numFullCycles) );

    let sumOfRemaining = 0;
    for ( idx = cycleStartIdx; idx < cycleStartIdx + remainingElementsCount; idx++ ) {
        sumOfRemaining += sequenceValues[idx];
    }
    totalSum += sumOfRemaining;
    console.log( totalSum );
};

processInput( require('fs').readFileSync('/dev/stdin', 'utf8') );