(function (sourceText) {
    const cleanLines = sourceText.trim().split(/\r?\n/);

    const assembleWorkload = (dataLines) => {
        let currentLineIndex = 0;

        const advanceLine = () => dataLines[currentLineIndex++];

        const jobQueue = [];

        while (true) {
            const dimensionsInput = advanceLine();
            const [itemCountStr, windowSizeStr] = dimensionsInput.split(' ');
            const itemCount = Number(itemCountStr);
            const windowSize = Number(windowSizeStr);

            if (itemCount === 0 && windowSize === 0) {
                break;
            }

            const numericalSequence = [];
            for (let itemIdx = 0; itemIdx < itemCount; itemIdx++) {
                numericalSequence.push(Number(advanceLine()));
            }

            jobQueue.push({
                totalElements: itemCount,
                segmentLength: windowSize,
                elementCollection: numericalSequence
            });
        }
        return jobQueue;
    };

    const determineMaxSegmentSum = (valueSet, intervalWidth) => {
        if (valueSet.length < intervalWidth || intervalWidth <= 0) {
            return -Infinity;
        }

        let currentIntervalTotal = 0;
        for (let i = 0; i < intervalWidth; i++) {
            currentIntervalTotal += valueSet[i];
        }

        let peakSumDiscovered = currentIntervalTotal;

        for (let i = intervalWidth; i < valueSet.length; i++) {
            currentIntervalTotal += valueSet[i] - valueSet[i - intervalWidth];
            peakSumDiscovered = Math.max(peakSumDiscovered, currentIntervalTotal);
        }
        return peakSumDiscovered;
    };

    const taskList = assembleWorkload(cleanLines);

    taskList.forEach(currentJob => {
        const finalResult = determineMaxSegmentSum(currentJob.elementCollection, currentJob.segmentLength);
        console.log(finalResult);
    });

})(require("fs").readFileSync("/dev/stdin", "utf8"));