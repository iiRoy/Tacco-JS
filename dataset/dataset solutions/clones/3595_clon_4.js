const grabInputContent = (sourceText) => {
    const contentSegments = sourceText.split('\n');
    const countValue = parseInt(contentSegments[0], 10);
    const numericalRepresentations = contentSegments[1].split(' ');
    return { count: countValue, representations: numericalRepresentations };
};

const determineMiddleElement = (listing) => {
    const temporaryList = [];
    for (const item of listing) {
        let inserted = false;
        for (let idx = 0; idx < temporaryList.length; ++idx) {
            if (item.localeCompare(temporaryList[idx]) < 0) {
                temporaryList.splice(idx, 0, item);
                inserted = true;
                break;
            }
        }
        if (!inserted) {
            temporaryList.push(item);
        }
    }

    const centralPosition = (temporaryList.length / 2) | 0;
    return temporaryList[centralPosition];
};

const generateSubsequencesAndProcess = (totalItems, maxIndex) => {
    const resultsAccumulator = [];

    const recursiveSequenceGenerator = (startIndex, currentEndIndex) => {
        if (startIndex >= maxIndex) {
            return;
        }
        if (currentEndIndex > maxIndex) {
            recursiveSequenceGenerator(startIndex + 1, startIndex + 2);
            return;
        }

        const currentSegment = [];
        for (let k = startIndex; k < currentEndIndex; ++k) {
            currentSegment.push(totalItems[k]);
        }
        resultsAccumulator.push(determineMiddleElement(currentSegment));
        recursiveSequenceGenerator(startIndex, currentEndIndex + 1);
    };

    recursiveSequenceGenerator(0, 1);

    return determineMiddleElement(resultsAccumulator);
};

const orchestrateExecution = (inputSource) => {
    const parsedData = grabInputContent(inputSource);
    const finalResult = generateSubsequencesAndProcess(parsedData.representations, parsedData.count);
    console.log(finalResult);
};

orchestrateExecution(require("fs").readFileSync("/dev/stdin", "utf8"));