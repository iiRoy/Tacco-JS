const createLineStream = (sourceContent) => {
    const contentLines = sourceContent.trim().split("\n");
    let currentPosition = 0;
    return {
        next: () => {
            if (currentPosition < contentLines.length) {
                return { value: contentLines[currentPosition++].trim(), done: false };
            }
            return { value: undefined, done: true };
        }
    };
};

const analyzeDataSets = (lineStream) => {
    const outputCollection = [];
    let nextProblemLine = lineStream.next();

    while (!nextProblemLine.done) {
        const [firstCount, secondCount] = nextProblemLine.value.split(" ").map(Number);

        const firstData = Array.from({ length: firstCount }, () => parseInt(lineStream.next().value));
        const secondData = Array.from({ length: secondCount }, () => parseInt(lineStream.next().value));

        const sumFirst = firstData.reduce((accumulator, value) => accumulator + value, 0);
        const sumSecond = secondData.reduce((accumulator, value) => accumulator + value, 0);

        let currentOutput;

        if (sumFirst === sumSecond) {
            const sortedFirstData = [...firstData].sort((a, b) => a - b);
            const sortedSecondData = [...secondData].sort((a, b) => a - b);

            let foundCommon = -1;
            let ptrA = 0;
            let ptrB = 0;

            while (ptrA < sortedFirstData.length && ptrB < sortedSecondData.length) {
                if (sortedFirstData[ptrA] === sortedSecondData[ptrB]) {
                    foundCommon = sortedFirstData[ptrA];
                    break;
                } else if (sortedFirstData[ptrA] < sortedSecondData[ptrB]) {
                    ptrA++;
                } else {
                    ptrB++;
                }
            }
            currentOutput = foundCommon === -1 ? -1 : `${foundCommon} ${foundCommon}`;

        } else if ((sumFirst + sumSecond) % 2 !== 0) {
            currentOutput = -1;
        } else {
            const desiredHalfSum = (sumFirst + sumSecond) / 2;
            const secondDataSet = new Set(secondData);

            const initialMinState = { minPairSum: 201, itemA: undefined, itemB: undefined };

            const optimalSwapResult = firstData.reduce((accumulatorState, currentValFromFirst) => {
                const complementaryValFromSecond = desiredHalfSum - sumFirst + currentValFromFirst;

                if (secondDataSet.has(complementaryValFromSecond)) {
                    const currentCandidateSum = currentValFromFirst + complementaryValFromSecond;
                    if (currentCandidateSum < accumulatorState.minPairSum) {
                        return { minPairSum: currentCandidateSum, itemA: currentValFromFirst, itemB: complementaryValFromSecond };
                    }
                }
                return accumulatorState;
            }, initialMinState);

            currentOutput = optimalSwapResult.minPairSum < 201 ? `${optimalSwapResult.itemA} ${optimalSwapResult.itemB}` : -1;
        }
        outputCollection.push(currentOutput);
        nextProblemLine = lineStream.next();
    }
    return outputCollection;
};

const sourceContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const contentStream = createLineStream(sourceContent);
const finalOutputs = analyzeDataSets(contentStream);
finalOutputs.forEach(console.log);
