const parseSource = (rawContent) => {
    const contentLines = rawContent.trim().split('\n');

    const interpretAsNumberOrString = (segment) => {
        const numericValue = Number(segment);
        return (Number.isFinite(numericValue)) ? numericValue : segment;
    };

    const convertLineToSegments = (lineString) => {
        return lineString.split(' ').map(interpretAsNumberOrString);
    };

    const getLineRange = (startLineIndex, numberOfLines) => {
        const endLineIndex = (numberOfLines != null && numberOfLines !== 0) ? startLineIndex + numberOfLines : undefined;
        return contentLines.slice(startLineIndex, endLineIndex);
    };

    return {
        fetchLine: (index) => contentLines[index],
        fetchLineAsArray: (index) => convertLineToSegments(contentLines[index]),
        fetchLineRangeProcessed: (startIndex, count) => getLineRange(startIndex, count).map(interpretAsNumberOrString),
        fetchLineRangeAsArrays: (startIndex, count) => getLineRange(startIndex, count).map(convertLineToSegments)
    };
};

const findSatisfyingPaths = (targetMask, remainingElements, currentPathState = { sumValue: 0, bitPattern: 0 }) => {
    const { sumValue: currentPathValue, bitPattern: currentPathMask } = currentPathState;
    
    if (remainingElements.length === 0) {
        return [];
    }

    return remainingElements.flatMap(currentItem => {
        const nextPathValue = currentPathValue + currentItem.valueComponent;
        const nextPathMask = currentPathMask | currentItem.maskComponent;
        let currentIterationResults = [];

        if (nextPathMask === targetMask) {
            currentIterationResults.push(nextPathValue);
        }

        const recursiveResults = findSatisfyingPaths(targetMask, remainingElements.slice(1), {
            sumValue: nextPathValue,
            bitPattern: nextPathMask
        });
        return currentIterationResults.concat(recursiveResults);
    });
};

const executeComputation = () => {
    const dataInterpreter = parseSource(require("fs").readFileSync("/dev/stdin", "utf8"));

    const [targetBitLength, pairCount] = dataInterpreter.fetchLineAsArray(0);

    const requiredBitmask = (1 << (targetBitLength + 1)) - 2;

    const rawComponentDetails = dataInterpreter.fetchLineRangeAsArrays(1);
    
    const processedElements = Array.from({length: pairCount}, (_, idx) => {
        const currentRawIndex = idx * 2;
        return {
            valueComponent: rawComponentDetails[currentRawIndex][0],
            maskComponent: rawComponentDetails[currentRawIndex + 1].reduce((accumulator, bitPosition) => {
                return accumulator | (1 << bitPosition);
            }, 0)
        };
    });

    const allFoundSums = findSatisfyingPaths(requiredBitmask, processedElements);

    if (allFoundSums.length === 0) {
        return -1;
    }

    const orderedSums = allFoundSums.sort((valA, valB) => valA - valB);

    return orderedSums[0];
};

console.log(executeComputation());