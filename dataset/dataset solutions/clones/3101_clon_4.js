const interpretInput = (sourceData) => {
    const allLines = sourceData.trim().split('\n');
    const [, ...relevantLines] = allLines;
    const [initialSequence, ...instructionLines] = relevantLines;

    const formattedInstructions = instructionLines.map(line =>
        line.split(' ').map(Number).map(val => val - 1)
    );

    return {
        sequenceText: initialSequence,
        instructionSet: formattedInstructions
    };
};

const buildCumulativeCounts = (textSequence) => {
    let currentTotal = 0;
    const countSequence = Array.from({ length: textSequence.length }, (_, indexPosition) => {
        if (indexPosition > 0 && textSequence[indexPosition - 1] === 'A' && textSequence[indexPosition] === 'C') {
            currentTotal++;
        }
        return currentTotal;
    });
    return countSequence;
};

const evaluateInstructions = (instructionList, sumRecord) => {
    const outcomeList = instructionList.map(([beginIndex, endIndex]) => {
        return sumRecord[endIndex] - sumRecord[beginIndex];
    });
    return outcomeList;
};

const executeTask = (inputPayload) => {
    const { sequenceText, instructionSet } = interpretInput(inputPayload);
    const cumulativeTotals = buildCumulativeCounts(sequenceText);
    const finalOutcomes = evaluateInstructions(instructionSet, cumulativeTotals);
    finalOutcomes.forEach(resultVal => console.log(resultVal));
};

executeTask(require('fs').readFileSync('/dev/stdin', 'utf8'));