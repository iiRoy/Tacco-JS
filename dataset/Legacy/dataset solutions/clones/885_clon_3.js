const fileSystemModule = require('fs');

const getStdinContent = () => {
    const stdinFileDescriptor = process.stdin.fd;
    const stdinContentSize = fileSystemModule.fstatSync(stdinFileDescriptor).size;

    if (stdinContentSize === 0) {
        return '';
    }

    const inputContentBuffer = Buffer.alloc(stdinContentSize);
    const actualBytesReadCount = fileSystemModule.readSync(stdinFileDescriptor, inputContentBuffer, 0, stdinContentSize, 0);
    return inputContentBuffer.toString('utf8', 0, actualBytesReadCount);
};

const parseInitialParameters = (firstLine) => {
    const parts = firstLine.split(' ');
    const totalEntriesCount = parseInt(parts[0], 10);
    const queryThresholdValue = parseInt(parts[1], 10);
    return { totalEntriesCount, queryThresholdValue };
};

function processProgramLogic() {
    const rawContent = getStdinContent();
    const allInputLines = rawContent.split('\n');

    const { totalEntriesCount, queryThresholdValue } = parseInitialParameters(allInputLines[0]);

    let finalSelectedName = 'kogakubu10gokan';

    for (let entryIterator = 1; entryIterator <= totalEntriesCount; entryIterator++) {
        const currentLine = allInputLines[entryIterator];
        const currentLineParts = currentLine.split(' ');
        const currentEntryValue = parseInt(currentLineParts[0], 10);

        if (queryThresholdValue <= currentEntryValue) {
            finalSelectedName = currentLineParts[1];
            break;
        }
    }

    console.log(finalSelectedName);
}

processProgramLogic();
