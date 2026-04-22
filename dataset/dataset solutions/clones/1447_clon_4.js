let capturedInputSegments = [];

process.stdin.on("data", (dataChunk) => {
    capturedInputSegments.push(dataChunk.toString());
});

process.stdin.on("end", () => {
    const fullInputText = capturedInputSegments.join("").trim();
    const allTextLines = fullInputText.split("\n");

    const interpretAsNumber = (textualValue) => parseFloat(textualValue);

    const aggregateValues = (numericalSequence) => numericalSequence.reduce((total, element) => total + element, 0);

    const deriveCentralTendency = (numericalSequence, specifiedCount) => {
        if (specifiedCount === 0) return 0;
        return aggregateValues(numericalSequence) / specifiedCount;
    };

    const computePopulationDispersion = (dataPoints, specifiedCount) => {
        if (specifiedCount === 0) return 0;

        const averageValue = deriveCentralTendency(dataPoints, specifiedCount);

        const sumOfSquaredDifferences = dataPoints.reduce((accumulator, point) => {
            const deviation = point - averageValue;
            return accumulator + (deviation * deviation);
        }, 0);

        const populationVariance = sumOfSquaredDifferences / specifiedCount;
        return Math.sqrt(populationVariance);
    };

    const iterateThroughProblemInstances = (collectionOfLines, currentLinePosition) => {
        if (currentLinePosition >= collectionOfLines.length) {
            return;
        }

        const currentLineItem = collectionOfLines[currentLinePosition];
        const numberOfElementsExpected = interpretAsNumber(currentLineItem);

        if (isNaN(numberOfElementsExpected) || numberOfElementsExpected === 0) {
            return;
        }

        const dataLinePosition = currentLinePosition + 1;
        if (dataLinePosition >= collectionOfLines.length) {
            return;
        }

        const rawNumericalStrings = collectionOfLines[dataLinePosition].split(" ");
        const actualNumericalValues = rawNumericalStrings.map(interpretAsNumber);

        const finalResult = computePopulationDispersion(actualNumericalValues, numberOfElementsExpected);
        console.log(finalResult.toFixed(8));

        iterateThroughProblemInstances(collectionOfLines, currentLinePosition + 2);
    };

    iterateThroughProblemInstances(allTextLines, 0);
});

process.stdin.resume();