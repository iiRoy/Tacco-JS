const MAX_DISPLAYABLE_ELEMENTS = 3;

const handleDataProcessing = (rawInputContent) => {
    try {
        if (typeof rawInputContent !== 'string' || rawInputContent === null) {
            console.error("Error: Input content must be a non-null string.");
            return;
        }

        const trimmedContent = rawInputContent.trim();
        const parsedSegments = trimmedContent.split('\n');

        if (parsedSegments.length === 0 || (parsedSegments.length === 1 && parsedSegments[0] === '')) {
            process.stdout.write("No meaningful data lines were found in the input.\n");
            return;
        }

        const compareNumericsDescending = (firstValue, secondValue) => {
            const numA = Number(firstValue);
            const numB = Number(secondValue);

            if (isNaN(numA) && isNaN(numB)) {
                return 0;
            }
            if (isNaN(numA)) {
                return 1;
            }
            if (isNaN(numB)) {
                return -1;
            }
            return numB - numA;
        };

        const numericallyOrderedData = parsedSegments.sort(compareNumericsDescending);

        const topSelectedEntries = numericallyOrderedData.slice(0, MAX_DISPLAYABLE_ELEMENTS);

        process.stdout.write(`\n--- Displaying Top ${MAX_DISPLAYABLE_ELEMENTS} Entries ---\n`);

        if (topSelectedEntries.length === 0) {
            process.stdout.write("No valid numeric entries were found to display.\n");
        } else {
            topSelectedEntries.forEach((currentEntry, idx) => {
                process.stdout.write(`  [${idx + 1}] -> ${currentEntry}\n`);
            });
        }
        process.stdout.write("--- End of Data Report ---\n\n");

    } catch (processingError) {
        console.error("An error occurred during data processing:", processingError.message);
    }
};

const standardInputDevicePath = '/dev/stdin';

try {
    const fileSystemUtility = require('fs');
    const readBufferContent = fileSystemUtility.readFileSync(standardInputDevicePath, 'utf8');
    
    handleDataProcessing(readBufferContent);

} catch (fileReadError) {
    console.error(`Failed to retrieve input from ${standardInputDevicePath}:`, fileReadError.message);
    process.exit(1);
}