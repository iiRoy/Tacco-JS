let aggregatedInputBuffer = '';
const inputSource = process.stdin;

inputSource.resume();
inputSource.setEncoding('utf8');

const handleDataArrival = (dataSegment) => {
    if (typeof dataSegment !== 'string' || dataSegment.length === 0) {
        return;
    }
    aggregatedInputBuffer += dataSegment;
};

const finalizeAndProcess = () => {
    if (aggregatedInputBuffer.trim().length === 0) {
        console.error('No input received to process.');
        return;
    }
    executeCoreLogic(aggregatedInputBuffer);
    aggregatedInputBuffer = '';
};

inputSource.on('data', handleDataArrival);
inputSource.on('end', finalizeAndProcess);

inputSource.on('error', (err) => {
    console.error('Input stream error:', err.message);
    process.exit(1);
});

function executeCoreLogic(rawPayload) {
    if (typeof rawPayload !== 'string' || rawPayload.trim().length === 0) {
        console.error('Invalid or empty payload provided for processing.');
        return;
    }

    const inputLines = rawPayload.split('\n').filter(line => line.trim().length > 0);

    const parseNumericValue = (strValue) => {
        const parsed = parseInt(strValue, 10);
        if (isNaN(parsed)) {
            console.warn(`Could not parse "${strValue}" as an integer. Returning 0.`);
            return 0;
        }
        return parsed;
    };

    const numericalDataSets = [];
    let processedLineCount = 0;

    for (const currentLine of inputLines) {
        const trimmedLine = currentLine.trim();
        if (trimmedLine.length === 0) {
            continue;
        }

        const stringNumbers = trimmedLine.split(' ');
        const currentDataSet = [];

        for (const numString of stringNumbers) {
            const potentialNumber = parseNumericValue(numString);
            currentDataSet.push(potentialNumber);
        }

        if (currentDataSet.length < 2) {
            console.warn(`Line "${currentLine}" does not contain enough numbers. Skipping.`);
            continue;
        }

        numericalDataSets.push(currentDataSet);
        processedLineCount++;
    }

    let operationIndex = 0;
    for (const dataEntry of numericalDataSets) {
        const firstComponent = dataEntry[0];
        const secondComponent = dataEntry[1];

        const calculatedSum = firstComponent + secondComponent;

        const outputMessage = `Result for operation ${operationIndex + 1}: ${firstComponent} + ${secondComponent} = ${calculatedSum}`;
        console.log(outputMessage);
        operationIndex++;
    }

    if (processedLineCount > 0) {
        console.info(`\nSuccessfully processed ${processedLineCount} valid data sets.`);
    } else {
        console.info('No valid data sets were processed.');
    }
}