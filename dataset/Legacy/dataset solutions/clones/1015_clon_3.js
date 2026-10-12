(function(rawInputString) {
    const parseInputData = (inputStr) => {
        const lines = inputStr.split('\n');
        const firstLine = lines.shift();
        const arrayLength = parseInt(firstLine, 10);
        const elements = lines.slice(0, arrayLength);
        return { arrayLength, elements };
    };

    let totalComparisonCount = 0;

    const generateShellGaps = (targetArrayLength) => {
        const gaps = [];
        let powerIndex = 0;

        while (true) {
            const currentGapValue = 1 << powerIndex;
            if (currentGapValue > targetArrayLength) {
                break;
            }
            gaps.unshift(currentGapValue);
            powerIndex++;
        }
        return gaps;
    };

    const executeShellSort = (targetArray, gapValues) => {
        const performGapInsertion = (arr, gapStep) => {
            const currentArrayLength = arr.length;
            for (let outerLoopIndex = gapStep; outerLoopIndex < currentArrayLength; outerLoopIndex++) {
                const valueToShift = arr[outerLoopIndex];
                let innerLoopIndex = outerLoopIndex - gapStep;

                while (innerLoopIndex >= 0 && arr[innerLoopIndex] > valueToShift) {
                    arr[innerLoopIndex + gapStep] = arr[innerLoopIndex];
                    innerLoopIndex -= gapStep;
                    totalComparisonCount++;
                }
                arr[innerLoopIndex + gapStep] = valueToShift;
            }
        };

        for (let gapSequenceIndex = 0; gapSequenceIndex < gapValues.length; gapSequenceIndex++) {
            const currentGapFromSequence = gapValues[gapSequenceIndex];
            performGapInsertion(targetArray, currentGapFromSequence);
        }
    };

    const { arrayLength: initialArraySize, elements: initialDataArray } = parseInputData(rawInputString);

    const shellGaps = generateShellGaps(initialArraySize);

    executeShellSort(initialDataArray, shellGaps);

    console.log(shellGaps.length);
    console.log(shellGaps.join(' '));
    console.log(totalComparisonCount);
    console.log(initialDataArray.join('\n'));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
