const processInputData = (sourceLocation) => {
    const fileSystemModule = require("fs");
    const rawContent = fileSystemModule.readFileSync(sourceLocation, "utf8");
    const segments = rawContent.trim().split(' ');

    const analysisSummary = {
        occurrenceCounts: new Map(),
        highestFrequency: 0,
        longestString: '',
        greatestLengthEncountered: 0
    };

    const finalSummary = segments.reduce((currentAccumulator, currentSegmentToken) => {
        // Update frequency statistics
        const currentTokenCount = (currentAccumulator.occurrenceCounts.get(currentSegmentToken) || 0) + 1;
        currentAccumulator.occurrenceCounts.set(currentSegmentToken, currentTokenCount);

        if (currentTokenCount > currentAccumulator.highestFrequency) {
            currentAccumulator.highestFrequency = currentTokenCount;
        }

        // Update longest string statistics
        const tokenLength = currentSegmentToken.length;
        if (tokenLength > currentAccumulator.greatestLengthEncountered) {
            currentAccumulator.greatestLengthEncountered = tokenLength;
            currentAccumulator.longestString = currentSegmentToken;
        }

        return currentAccumulator;
    }, analysisSummary);

    console.log(`${finalSummary.highestFrequency} ${finalSummary.longestString}`);
};

processInputData("/dev/stdin");