function solvePuzzle(rawData) {
    const extractedNumbers = rawData.match(/\d+/g).map(Number);
    const initialElementCount = extractedNumbers[0];
    const initialSequence = extractedNumbers.slice(1);

    const reduceSequenceRecursively = (currentSequence) => {
        if (currentSequence.length === 1) {
            return currentSequence[0];
        }

        const nextSequence = [];
        for (let position = 0; position <= currentSequence.length - 3; ++position) {
            const firstValue = currentSequence[position];
            const secondValue = currentSequence[position + 1];
            const thirdValue = currentSequence[position + 2];

            const medianValue = (firstValue + secondValue + thirdValue) - Math.min(firstValue, secondValue, thirdValue) - Math.max(firstValue, secondValue, thirdValue);
            nextSequence.push(medianValue);
        }

        return reduceSequenceRecursively(nextSequence);
    };

    const finalResult = reduceSequenceRecursively(initialSequence);
    const outputFormat = 'the answer is %d';
    console.log(outputFormat, finalResult);
}

solvePuzzle(require("fs").readFileSync("/dev/stdin", "utf8"));