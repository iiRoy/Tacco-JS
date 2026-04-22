let fullInputAccumulator = '';
let processingInitiated = false;

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (incomingDataChunk) => {
    fullInputAccumulator += incomingDataChunk;
});

process.stdin.on('end', () => {
    if (!processingInitiated) {
        processingInitiated = true;
        initiateProcessingRoutine(fullInputAccumulator);
    }
});

function initiateProcessingRoutine(completeInputString) {
    const parsedSegments = completeInputString.split('\n');
    let segmentReadHead = 0;

    const fetchNextSegment = () => {
        if (segmentReadHead >= parsedSegments.length) {
            return undefined;
        }
        return parsedSegments[segmentReadHead++].trim();
    };

    const evaluateNextDataBlock = () => {
        const blockControlSegment = fetchNextSegment();

        if (blockControlSegment === undefined) {
            return;
        }

        const currentBlockItemCount = Number.parseInt(blockControlSegment, 10);

        if (currentBlockItemCount === 0) {
            return;
        }

        const itemSummaries = new Map();
        const valueThreshold = 1000000;

        for (let itemOrdinal = 0; itemOrdinal < currentBlockItemCount; ++itemOrdinal) {
            const itemDescriptionSegment = fetchNextSegment();

            if (itemDescriptionSegment === undefined) {
                return;
            }

            const itemComponents = itemDescriptionSegment.split(" ");
            const itemKey = itemComponents[0];
            const priceNumerical = Number.parseInt(itemComponents[1], 10);
            const quantityNumerical = Number.parseInt(itemComponents[2], 10);

            const instantaneousTotal = priceNumerical * quantityNumerical;

            const priorAccumulation = itemSummaries.get(itemKey) || 0;
            itemSummaries.set(itemKey, priorAccumulation + instantaneousTotal);
        }

        let highValueItemFound = false;
        const resultIdentifiers = [];

        itemSummaries.forEach((accumulatedValue, identifier) => {
            if (accumulatedValue >= valueThreshold) {
                resultIdentifiers.push(identifier);
                highValueItemFound = true;
            }
        });

        if (highValueItemFound) {
            resultIdentifiers.forEach(id => process.stdout.write(id + '\n'));
        } else {
            process.stdout.write("NA\n");
        }

        evaluateNextDataBlock();
    };

    evaluateNextDataBlock();
}