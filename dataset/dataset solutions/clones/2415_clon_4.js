const performTransformation = (rawData) => {
    const dataSegments = rawData.trim().split("\n");
    const [configLine, ...patternLines] = dataSegments;
    const [dimensionA, dimensionB, ignoredParameter] = configLine.split(" ");

    const numRows = Number(dimensionA);
    const numCols = Number(dimensionB);

    const sourcePattern = patternLines.slice(0, numRows).map(line => line.split(""));

    const gridReducer = (accumulatedInfo, currentPatternRow) => {
        const rowProcessingResult = currentPatternRow.reduce((cellAccumulator, cellSymbol) => {
            let identifierForCell = cellAccumulator.localIdentifier;
            let updatedActiveSegmentFlag = cellAccumulator.activeSegmentFlag;

            if (cellSymbol === "#") {
                if (cellAccumulator.activeSegmentFlag) {
                    identifierForCell++;
                    updatedActiveSegmentFlag = false;
                }
                updatedActiveSegmentFlag = true;
            }
            
            return {
                localIdentifier: identifierForCell,
                activeSegmentFlag: updatedActiveSegmentFlag,
                rowSegmentIdentifiers: [...cellAccumulator.rowSegmentIdentifiers, identifierForCell]
            };
        }, { localIdentifier: accumulatedInfo.globalIdentifier, activeSegmentFlag: false, rowSegmentIdentifiers: [] });

        const nextGlobalIdentifier = rowProcessingResult.localIdentifier + 1;

        return {
            globalIdentifier: nextGlobalIdentifier,
            processedLayout: [...accumulatedInfo.processedLayout, rowProcessingResult.rowSegmentIdentifiers]
        };
    };

    const finalLayoutData = sourcePattern.reduce(gridReducer, { globalIdentifier: 1, processedLayout: [] });

    return finalLayoutData.processedLayout.map(row => row.join("")).join("\n");
};

const runProcessor = () => {
    const rawDataFeed = require('fs').readFileSync('/dev/stdin', 'utf8');
    const displayOutput = performTransformation(rawDataFeed);
    console.log(displayOutput);
};

runProcessor();