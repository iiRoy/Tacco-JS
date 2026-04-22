const processNumericalSequence = (sourceText) => {
    const cleanedSource = sourceText.replace(/^\s+|\s+$/g, '');
    const extractedNumbers = (cleanedSource.match(/-?\d+/g) || []).map(valStr => parseInt(valStr, 10));

    if (extractedNumbers.length < 3) {
        return "NO";
    }

    const componentX = extractedNumbers[0];
    const componentY = extractedNumbers[1];
    const componentZ = extractedNumbers[2];

    const combinedXY = componentX + componentY;

    return ((componentZ - componentX) >= 0 && (combinedXY - componentZ) >= 0) ? "YES" : "NO";
};

const deliverOutcome = (messageContent) => {
    process.stdout.write(messageContent + '\n');
};

const orchestrateExecution = () => {
    const systemIO = require('fs');

    const inputBuffer = Buffer.alloc(1024);
    let readBytes = 0;
    let fullInputData = '';

    try {
        while ((readBytes = systemIO.readSync(process.stdin.fd, inputBuffer, 0, inputBuffer.length)) > 0) {
            fullInputData += inputBuffer.toString('utf8', 0, readBytes);
        }
    } catch (ioError) {
        throw ioError;
    }

    const analysisResult = processNumericalSequence(fullInputData);
    deliverOutcome(analysisResult);
};

orchestrateExecution();