const performCyclicShiftCounting = (sourceData) => {
    const initialCharacterArray = sourceData.split('\n')[0].split('');

    const innerScanRecursive = (index, currentList, currentPassModifications) => {
        if (index >= currentList.length - 2) {
            return { mods: currentPassModifications, changed: currentPassModifications > 0 };
        }

        if (currentList[index] === 'A' &&
            currentList[index + 1] === 'B' &&
            currentList[index + 2] === 'C') {
            
            currentList[index] = 'B';
            currentList[index + 1] = 'C';
            currentList[index + 2] = 'A';
            
            return innerScanRecursive(index + 1, currentList, currentPassModifications + 1);
        } else {
            return innerScanRecursive(index + 1, currentList, currentPassModifications);
        }
    };

    const iterativeTransformationProcess = (charsReference, currentOffset, overallCount) => {
        const passOutcome = innerScanRecursive(currentOffset, charsReference, 0);

        if (passOutcome.changed) {
            return iterativeTransformationProcess(charsReference, currentOffset + 2, overallCount + passOutcome.mods);
        } else {
            return overallCount;
        }
    };

    return iterativeTransformationProcess(initialCharacterArray, 0, 0);
};

const applicationRunner = (inputData) => {
    const finalTally = performCyclicShiftCounting(inputData);
    console.log(finalTally);
};

applicationRunner(require('fs').readFileSync('/dev/stdin', 'utf8'));