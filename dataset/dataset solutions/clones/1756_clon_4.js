function processInputData(sourceText) {
    const textSegments = sourceText.split('\n');
    const numericalStrings = textSegments[1].split(' ');

    const parsedNumbers = numericalStrings.reduce((accumulatorList, currentStringSegment) => {
        accumulatorList.push(parseInt(currentStringSegment, 10));
        return accumulatorList;
    }, []);

    function computeAggregateXOR(valueCollection, currentPosition = 0, accumulatedXOR = 0) {
        if (currentPosition === valueCollection.length) {
            return accumulatedXOR;
        }
        return computeAggregateXOR(valueCollection, currentPosition + 1, accumulatedXOR ^ valueCollection[currentPosition]);
    }

    const overallXorResult = computeAggregateXOR(parsedNumbers);

    function generateDerivedSequence(initialSet, commonXORValue, currentIndex = 0, resultantSequence = []) {
        if (currentIndex === initialSet.length) {
            return resultantSequence;
        }
        resultantSequence.push(commonXORValue ^ initialSet[currentIndex]);
        return generateDerivedSequence(initialSet, commonXORValue, currentIndex + 1, resultantSequence);
    }

    const transformedOutputSequence = generateDerivedSequence(parsedNumbers, overallXorResult);

    function formatSequenceOutput(itemsToFormat, currentItemIndex = 0, outputString = "") {
        if (currentItemIndex === itemsToFormat.length) {
            return outputString;
        }
        const separationChar = currentItemIndex === 0 ? "" : " ";
        return formatSequenceOutput(itemsToFormat, currentItemIndex + 1, outputString + separationChar + itemsToFormat[currentItemIndex]);
    }

    console.log(formatSequenceOutput(transformedOutputSequence));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());