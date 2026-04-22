const determineOptimalSegmentationCost = (dataPayload) => {
    const dataLines = dataPayload.split('\n');

    const [firstValue, secondValue] = dataLines[0].split(' ').map(Number);
    const numericElements = dataLines[1].split(' ').map(Number);

    numericElements.sort((left, right) => left - right);

    const differencesCollection = numericElements.slice(1).map((currentElement, idx) => currentElement - numericElements[idx]);

    differencesCollection.sort((gapA, gapB) => gapA - gapB);

    const segmentsToConsider = Math.max(0, secondValue - firstValue);

    const accumulatedResult = differencesCollection.slice(0, segmentsToConsider).reduce((total, current) => total + current, 0);

    return accumulatedResult;
};

const getRawContentFromSource = (sourcePath, encodingType) => {
    const libraryLoader = require; 
    const fileSystemOps = libraryLoader('node:fs'); 
    
    const fileDescriptor = fileSystemOps.openSync(sourcePath, 'r');
    
    const fileStats = fileSystemOps.fstatSync(fileDescriptor);
    const contentBuffer = Buffer.alloc(fileStats.size);
    
    fileSystemOps.readSync(fileDescriptor, contentBuffer, 0, fileStats.size, 0);
    
    fileSystemOps.closeSync(fileDescriptor);
    
    return contentBuffer.toString(encodingType);
};

process.stdout.write(String(determineOptimalSegmentationCost(getRawContentFromSource('/dev/stdin', 'utf8'))));