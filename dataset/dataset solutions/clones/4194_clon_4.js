'use strict'

const processInputAndCompute = (dataString) => {
    const rawSegments = dataString.trim().split('\n');
    const recordCount = parseFloat(rawSegments[0]);
    
    const featureConfigurations = rawSegments.slice(1, 1 + recordCount).map(
        lineSegment => {
            return lineSegment.split(' ').reduce((accumulator, bitChar) => {
                return (accumulator << 1) | parseFloat(bitChar);
            }, 0);
        }
    );

    const profitTables = rawSegments.slice(1 + recordCount, 1 + recordCount * 2).map(
        lineSegment => lineSegment.split(' ').map(parseFloat)
    );

    const countSetBits = (valueToCount) => {
        let bitTally = 0;
        let workingValue = valueToCount;
        while (workingValue > 0) {
            bitTally += workingValue & 1;
            workingValue >>= 1;
        }
        return bitTally;
    };

    const allPossibleSetups = Array.from({ length: 1023 }, (_, k) => k + 1);

    const maximumYield = allPossibleSetups.reduce((currentMaxYield, chosenSetup) => {
        
        const currentSetupGain = featureConfigurations.reduce((totalGainForSetup, singleFeatureConfig, entityIndex) => {
            const commonBitsMask = singleFeatureConfig & chosenSetup;
            const overlapCount = countSetBits(commonBitsMask);
            
            return totalGainForSetup + profitTables[entityIndex][overlapCount];
        }, 0);

        return Math.max(currentMaxYield, currentSetupGain);

    }, -Number.MAX_VALUE);

    return maximumYield;
};

const applicationEntry = () => {
    const inputData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
    const finalOutcome = processInputAndCompute(inputData);
    process.stdout.write(finalOutcome.toString() + '\n');
};

applicationEntry();