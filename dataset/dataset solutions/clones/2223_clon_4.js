const getNumberCharacteristics = (val) => {
    const textRepresentation = String(val);
    const initialDigit = parseInt(textRepresentation[0], 10);
    const finalDigit = parseInt(textRepresentation[textRepresentation.length - 1], 10);
    const digitCount = textRepresentation.length;
    return { initialDigit, finalDigit, digitCount };
};

const produceThreeDigitCandidates = (firstBoundary, lastBoundary, upperLimit) => {
    const potentialValues = [];
    for (let middleDigit = 0; middleDigit <= 9; ++middleDigit) {
        const formedValue = parseInt(`${firstBoundary}${middleDigit}${lastBoundary}`, 10);
        if (formedValue <= upperLimit) {
            potentialValues.push(formedValue);
        } else {
            break;
        }
    }
    return potentialValues;
};

const determineAggregateScore = (sourceInputData) => {
    const numericalCeiling = parseInt(sourceInputData.split('\n')[0].split(' ')[0], 10);
    const numericalCeilingLength = numericalCeiling.toString().length;

    let cumulativeScore = 0;

    for (let leftHandValue = 1; leftHandValue < numericalCeiling; ++leftHandValue) {
        const { initialDigit: leftInitial, finalDigit: leftFinal, digitCount: leftLength } = getNumberCharacteristics(leftHandValue);

        let targetRightInitial, targetRightFinal;

        if (leftLength === 1) {
            // If the left-hand value is a single digit, its initial and final digits are the same.
            // The original logic counts B=leftHandValue and B=leftHandValue*10+leftHandValue unconditionally.
            cumulativeScore++; // Corresponds to B being the single digit leftHandValue
            cumulativeScore++; // Corresponds to B being the two-digit leftHandValue concatenated with itself
            
            targetRightInitial = leftInitial;
            targetRightFinal = leftInitial;
        } else { // leftHandValue has multiple digits
            if (leftInitial === leftFinal) {
                // If left-hand value has multiple digits but its initial and final digits are the same.
                // The original logic counts B=leftInitial and B=leftInitial*10+leftInitial unconditionally.
                cumulativeScore++; // Corresponds to B being the single digit leftInitial
                cumulativeScore++; // Corresponds to B being the two-digit leftInitial concatenated with itself
                
                targetRightInitial = leftInitial;
                targetRightFinal = leftInitial;
            } else {
                // If left-hand value has multiple digits and its initial and final digits are different.
                // The original logic does not count single or double digit B's in this specific sub-case.
                targetRightInitial = leftFinal;
                targetRightFinal = leftInitial;
            }
        }

        // The original logic's `j > 2` block (for 3-digit B values)
        // This part is executed if N's length is 3 or more.
        if (numericalCeilingLength >= 3) {
            const threeDigitCandidateList = produceThreeDigitCandidates(targetRightInitial, targetRightFinal, numericalCeiling);
            cumulativeScore += threeDigitCandidateList.length;
        }
    }
    console.log(cumulativeScore);
};

determineAggregateScore(require('fs').readFileSync('/dev/stdin', 'utf8'));