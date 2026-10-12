(function(inputSource) {
    const parsedLines = inputSource.split('\n');
    const itemCount = parseInt(parsedLines.shift(), 10);
    const dataElements = parsedLines.slice(0, itemCount);

    let globalComparisonCounter = 0;

    const generateGaps = (limit) => {
        const gapsAscending = [];
        let currentPowerOfTwo = 1;
        while (currentPowerOfTwo <= limit) {
            gapsAscending.push(currentPowerOfTwo);
            currentPowerOfTwo <<= 1;
        }
        return gapsAscending.reverse();
    };

    const gapSequence = generateGaps(dataElements.length);

    const performShellSort = (targetArray, gaps) => {
        gaps.forEach(currentGap => {
            const applyGappedInsertion = (arr, gap) => {
                Array.from({ length: Math.ceil((arr.length - gap) / gap) }, (_, k) => gap + k * gap)
                     .forEach(mainIdx => {
                        const elementValue = arr[mainIdx];
                        let subIdx = mainIdx - gap;

                        const shiftAndPlace = (currentSubIdx, valToPlace) => {
                            if (currentSubIdx < 0 || arr[currentSubIdx] <= valToPlace) {
                                arr[currentSubIdx + gap] = valToPlace;
                                return;
                            }
                            arr[currentSubIdx + gap] = arr[currentSubIdx];
                            globalComparisonCounter++;
                            shiftAndPlace(currentSubIdx - gap, valToPlace);
                        };

                        shiftAndPlace(subIdx, elementValue);
                    });
            };
            applyGappedInsertion(targetArray, currentGap);
        });
    };

    performShellSort(dataElements, gapSequence);

    console.log(gapSequence.length);
    console.log(gapSequence.join(' '));
    console.log(globalComparisonCounter);
    console.log(dataElements.join('\n'));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
