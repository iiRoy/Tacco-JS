const makeInputConsumer = (fullText) => {
    const allLines = fullText.trim().split('\n');
    let currentLinePointer = 0;
    let currentLineParts = [];
    let partPointer = 0;

    const getNextPart = () => {
        if (partPointer >= currentLineParts.length) {
            if (currentLinePointer >= allLines.length) {
                return null;
            }
            currentLineParts = allLines[currentLinePointer].split(' ');
            currentLinePointer++;
            partPointer = 0;
        }
        return currentLineParts[partPointer++];
    };

    return {
        grabInteger: () => parseInt(getNextPart(), 10)
    };
};

const executeSolution = (rawData) => {
    const inputGrabber = makeInputConsumer(rawData);

    while (true) {
        const countX = inputGrabber.grabInteger();
        const countY = inputGrabber.grabInteger();

        if (countX === 0 && countY === 0) {
            break;
        }

        const xComponents = Array.from({ length: countX }, () => inputGrabber.grabInteger());
        const yComponents = Array.from({ length: countY }, () => inputGrabber.grabInteger());

        const getCumulativeSums = (parts) => {
            return parts.reduce((accumulator, currentElement) => {
                accumulator.push(accumulator[accumulator.length - 1] + currentElement);
                return accumulator;
            }, [0]);
        };

        const xCumulative = getCumulativeSums(xComponents);
        const yCumulative = getCumulativeSums(yComponents);

        const buildFrequencyMap = (cumulativeValues) => {
            const allDifferences = [];
            for (let startIdx = 0; startIdx < cumulativeValues.length; ++startIdx) {
                for (let endIdx = startIdx + 1; endIdx < cumulativeValues.length; ++endIdx) {
                    allDifferences.push(cumulativeValues[endIdx] - cumulativeValues[startIdx]);
                }
            }
            return allDifferences.reduce((mapOfCounts, value) => {
                mapOfCounts.set(value, (mapOfCounts.get(value) || 0) + 1);
                return mapOfCounts;
            }, new Map());
        };

        const xFrequencies = buildFrequencyMap(xCumulative);
        const yFrequencies = buildFrequencyMap(yCumulative);

        let totalMatches = 0;
        for (const [val, countA] of xFrequencies.entries()) {
            if (yFrequencies.has(val)) {
                totalMatches += countA * yFrequencies.get(val);
            }
        }
        console.log(totalMatches);
    }
};

executeSolution(require("fs").readFileSync("/dev/stdin","utf8"));