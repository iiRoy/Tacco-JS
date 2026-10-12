const fileSystemModule = require('fs');
const rawTextContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const allInputLines = rawTextContent.trim().split('\n');

const formatValueForDisplay = (num) => ("     " + num).slice(-5);

function* dataBlockProcessor(lines) {
    let currentBlockSize = 0;
    let currentBlockRecords = [];
    let linePointer = 0;

    const initialConfigurationLine = lines[linePointer++];
    currentBlockSize = Number(initialConfigurationLine.split(" ")[0]);

    while (linePointer < lines.length) {
        const currentLine = lines[linePointer];
        const numericSegments = currentLine.split(" ").map(Number);

        if (numericSegments.length === 1) {
            const controlIdentifier = numericSegments[0];

            yield {
                blockDimension: currentBlockSize,
                collectedEntries: currentBlockRecords,
                isFinalBlock: (controlIdentifier === 0)
            };

            if (controlIdentifier === 0) {
                return;
            }

            currentBlockSize = controlIdentifier;
            currentBlockRecords = [];

        } else {
            const entrySum = numericSegments.reduce((accumulator, value) => accumulator + value, 0);
            currentBlockRecords.push([...numericSegments, entrySum]);
        }
        linePointer++;
    }

    if (currentBlockRecords.length > 0) {
        yield {
            blockDimension: currentBlockSize,
            collectedEntries: currentBlockRecords,
            isFinalBlock: false
        };
    }
}

for (const processedBlock of dataBlockProcessor(allInputLines)) {
    if (processedBlock.collectedEntries.length > 0) {
        const blockColumnTotals = Array(processedBlock.blockDimension + 1).fill(0);

        processedBlock.collectedEntries.forEach(entry => {
            entry.forEach((val, index) => {
                blockColumnTotals[index] += val;
            });
        });

        processedBlock.collectedEntries.forEach(entry => {
            console.log(entry.map(formatValueForDisplay).join(""));
        });

        console.log(blockColumnTotals.map(formatValueForDisplay).join(""));
    }

    if (processedBlock.isFinalBlock) {
        break;
    }
}
