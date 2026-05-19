function calculateSequenceValues(inputData) {
    const processedLines = inputData.split("\n");
    const characterSequence = processedLines[0].split('');
    const sequenceLength = characterSequence.length;
    const totalPositions = sequenceLength + 1;

    const leftPropagatedValues = [0];
    characterSequence.reduce((currentValue, symbol) => {
        const nextValue = (symbol === '<') ? currentValue + 1 : 0;
        leftPropagatedValues.push(nextValue);
        return nextValue;
    }, 0);

    const rightPropagatedValues = characterSequence.reduceRight((accumulator, symbol) => {
        const [currentScore, scoresList] = accumulator;
        const nextScore = (symbol === '>') ? currentScore + 1 : 0;
        scoresList.unshift(nextScore);
        return [nextScore, scoresList];
    }, [0, [0]])[1];

    const finalResult = Array.from({ length: totalPositions }, (_, index) =>
        Math.max(leftPropagatedValues[index], rightPropagatedValues[index])
    ).reduce((sumAccumulator, positionValue) => sumAccumulator + positionValue, 0);

    console.log('%s', finalResult);
    return finalResult;
}

calculateSequenceValues(require("fs").readFileSync("/dev/stdin", "utf8"));
