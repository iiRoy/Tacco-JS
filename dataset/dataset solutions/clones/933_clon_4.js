const outputChannel = console.log;

const computeSequenceMetric = (firstSequence, secondSequence) => {
    const rCount = firstSequence.length;
    const cCount = secondSequence.length;

    if (rCount === 0 || cCount === 0) {
        return;
    }

    const memoizedGrid = Array.from({ length: rCount }, () => Array.from({ length: cCount }, () => null));

    const calculateCell = (rowIdx, colIdx) => {
        if (memoizedGrid[rowIdx][colIdx] !== null) {
            return memoizedGrid[rowIdx][colIdx];
        }

        const currentMatchCoefficient = (firstSequence.charAt(rowIdx) === secondSequence.charAt(colIdx)) ? 1 : 0;
        let cellResult;

        if (rowIdx === 0 && colIdx === 0) {
            cellResult = currentMatchCoefficient;
        } else if (rowIdx === 0) {
            cellResult = Math.max(calculateCell(rowIdx, colIdx - 1), currentMatchCoefficient);
        } else if (colIdx === 0) {
            cellResult = Math.max(calculateCell(rowIdx - 1, colIdx), currentMatchCoefficient);
        } else {
            const valAbove = calculateCell(rowIdx - 1, colIdx);
            const valLeft = calculateCell(rowIdx, colIdx - 1);
            cellResult = Math.min(
                Math.max(valAbove, valLeft) + currentMatchCoefficient,
                Math.min(rowIdx, colIdx) + 1
            );
        }

        memoizedGrid[rowIdx][colIdx] = cellResult;
        return cellResult;
    };

    for (let r = 0; r < rCount; r++) {
        for (let c = 0; c < cCount; c++) {
            calculateCell(r, c);
        }
    }
};

const coordinateProcessing = (streamPayloads) => {
    const relevantPayloads = streamPayloads.slice(1);

    const recursivePairProcessor = (remainingPayloads) => {
        if (remainingPayloads.length < 2) {
            return;
        }

        const currentDataPair = remainingPayloads.slice(0, 2);

        const cleansedPair = currentDataPair.map(chunkItem =>
            chunkItem.replace(/[^a-z]/g, '')
        );

        computeSequenceMetric(cleansedPair[0], cleansedPair[1]);

        recursivePairProcessor(remainingPayloads.slice(2));
    };

    recursivePairProcessor(relevantPayloads);
};

const initializeExecutionEnvironment = () => {
    if (typeof process !== "undefined") {
        let inputBufferAccumulator = "";

        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        process.stdin.on('data', (dataChunk) => {
            inputBufferAccumulator += dataChunk;
        });

        process.stdin.on('end', () => {
            const processedInputLines = inputBufferAccumulator.split("\n");
            coordinateProcessing(processedInputLines);
        });
    }
};

initializeExecutionEnvironment();