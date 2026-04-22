const integerExtractor = (textualRepresentation) => Number(textualRepresentation);

const makePosition = (verticalIndex, horizontalIndex) => ({
    yCoord: verticalIndex,
    xCoord: horizontalIndex,
    areIdentical: function(otherPosition) {
        return this.yCoord === otherPosition.yCoord && this.xCoord === otherPosition.xCoord;
    },
    toKeyString: function() {
        return `${this.yCoord},${this.xCoord}`;
    }
});

const makeExchange = (startingPoint, endingPoint) => ({
    source: startingPoint,
    target: endingPoint,
    render: function() {
        return `${this.source.yCoord} ${this.source.xCoord} ${this.target.yCoord} ${this.target.xCoord}`;
    }
});

const processInputConfiguration = (lineSet) => {
    const [dimensionSpec, ...gridRowData] = lineSet;
    const [gridHeightVal, gridWidthVal] = dimensionSpec.split(' ').map(integerExtractor);

    const identifiedOddPositions = gridRowData.flatMap((rowText, currentYIndex) => {
        return rowText.split(' ').map(integerExtractor).flatMap((cellNumericalValue, currentXIndex) => {
            if (cellNumericalValue % 2 !== 0) {
                return [makePosition(currentYIndex + 1, currentXIndex + 1)];
            }
            return [];
        });
    });

    const accumulatedExchanges = [];
    let currentPositionBuffer = [];

    for (const position of identifiedOddPositions) {
        currentPositionBuffer.push(position);
        if (currentPositionBuffer.length === 2) {
            const [initialSpot, finalSpot] = currentPositionBuffer;
            let intermediateSpot = makePosition(initialSpot.yCoord, initialSpot.xCoord);

            const horizontalMoves = Array.from({ length: finalSpot.xCoord - intermediateSpot.xCoord }, (_, idx) => {
                const priorX = intermediateSpot.xCoord + idx;
                const nextX = priorX + 1;
                return makeExchange(makePosition(intermediateSpot.yCoord, priorX), makePosition(intermediateSpot.yCoord, nextX));
            });
            accumulatedExchanges.push(...horizontalMoves);
            intermediateSpot.xCoord = finalSpot.xCoord;

            const verticalMoves = Array.from({ length: finalSpot.yCoord - intermediateSpot.yCoord }, (_, idx) => {
                const priorY = intermediateSpot.yCoord + idx;
                const nextY = priorY + 1;
                return makeExchange(makePosition(priorY, intermediateSpot.xCoord), makePosition(nextY, intermediateSpot.xCoord));
            });
            accumulatedExchanges.push(...verticalMoves);
            intermediateSpot.yCoord = finalSpot.yCoord;

            currentPositionBuffer = [];
        }
    }

    return {
        totalTransferCount: accumulatedExchanges.length,
        transferDescriptionList: accumulatedExchanges.map(exchange => exchange.render())
    };
};

const orchestrateProcessingAndOutput = (systemInput) => {
    const processingResult = processInputConfiguration(systemInput);
    console.log(processingResult.totalTransferCount);
    console.log(processingResult.transferDescriptionList.join('\n'));
};

const initiateSystemExecution = () => {
    const rawFileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    const preparedLines = rawFileContent.trim().split('\n');
    orchestrateProcessingAndOutput(preparedLines);
};

initiateSystemExecution();