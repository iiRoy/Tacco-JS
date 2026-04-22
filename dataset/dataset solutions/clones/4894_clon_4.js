function processData(rawData) {
    const dataSegments = rawData.split('\n');
    const numericStrings = dataSegments[1].split(' ');
    const initialNumericSequence = numericStrings.map(value => Number(value));

    const determineCentralValue = (first, second, third) => {
        return first + second + third - Math.min(first, second, third) - Math.max(first, second, third);
    };

    const iterativelyReduceSequence = (currentSequence) => {
        if (currentSequence.length <= 1) {
            return currentSequence[0];
        }

        const nextIterationSequence = Array.from({ length: currentSequence.length - 2 }, (_, index) => {
            const valA = currentSequence[index];
            const valB = currentSequence[index + 1];
            const valC = currentSequence[index + 2];
            return determineCentralValue(valA, valB, valC);
        });

        return iterativelyReduceSequence(nextIterationSequence);
    };

    const finalResult = iterativelyReduceSequence(initialNumericSequence);

    console.log('%d', finalResult);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));