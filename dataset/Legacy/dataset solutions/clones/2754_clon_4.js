function ProcessData(rawData) {
    const initialNumericSequence = rawData.split('\n')[1].split(' ').map(Number);

    const reduceSequenceRecursively = (currentSequence) => {
        if (currentSequence.length <= 2) {
            return currentSequence;
        }

        let smallestValue = Infinity;
        let smallestValueAbsoluteIndex = -1;

        currentSequence.slice(1, -1).forEach((val, relativeIdx) => {
            if (val < smallestValue) {
                smallestValue = val;
                smallestValueAbsoluteIndex = relativeIdx + 1;
            }
        });

        const precedingElement = currentSequence[smallestValueAbsoluteIndex - 1];
        const centralElement = currentSequence[smallestValueAbsoluteIndex];
        const succeedingElement = currentSequence[smallestValueAbsoluteIndex + 1];

        const nextSequence = [];
        for (let idx = 0; idx < currentSequence.length; idx++) {
            if (idx === smallestValueAbsoluteIndex) {
                continue;
            } else if (idx === smallestValueAbsoluteIndex - 1) {
                nextSequence.push(precedingElement + centralElement);
            } else if (idx === smallestValueAbsoluteIndex + 1) {
                nextSequence.push(succeedingElement + centralElement);
            } else {
                nextSequence.push(currentSequence[idx]);
            }
        }

        return reduceSequenceRecursively(nextSequence);
    };

    const finalReducedSequence = reduceSequenceRecursively(initialNumericSequence);
    const finalResultSum = finalReducedSequence[0] + finalReducedSequence[1];

    console.log(finalResultSum);
}

ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
