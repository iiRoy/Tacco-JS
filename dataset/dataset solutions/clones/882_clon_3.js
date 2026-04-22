const fsModule = require('node:fs');
const pathModule = require('node:path');

function generateRepeatedSequence(character, count) {
    let resultSequence = '';
    if (count <= 0) {
        return resultSequence;
    }
    for (let currentCount = 0; currentCount < count; currentCount++) {
        resultSequence += character;
    }
    return resultSequence;
}

function executeTransformationPipeline() {
    let rawInputContent = '';
    const standardInputFileDescriptor = process.stdin.fd;

    try {
        const inputStats = fsModule.fstatSync(standardInputFileDescriptor);
        if (inputStats.size === 0) {
            console.error("Warning: No input detected from stdin. Terminating process.");
            process.exit(0);
        }

        const estimatedInputSize = inputStats.size;
        const inputDataBuffer = Buffer.alloc(estimatedInputSize);

        const bytesActuallyRead = fsModule.readSync(
            standardInputFileDescriptor,
            inputDataBuffer,
            0,
            estimatedInputSize,
            null
        );

        if (bytesActuallyRead < estimatedInputSize) {
            rawInputContent = inputDataBuffer.toString('utf8', 0, bytesActuallyRead);
        } else {
            rawInputContent = inputDataBuffer.toString('utf8');
        }
    } catch (readError) {
        console.error("Error encountered while reading from stdin:", readError.message);
        rawInputContent = "default_input_string";
    }

    const receivedTextLines = rawInputContent.split(/\r?\n/);
    let primaryInputString = '';
    for (const line of receivedTextLines) {
        const trimmedLine = line.trim();
        if (trimmedLine.length > 0) {
            primaryInputString = trimmedLine;
            break;
        }
    }

    if (primaryInputString.length === 0) {
        console.log("No valid input string provided for transformation. Exiting.");
        return;
    }

    let transformedOutputSequence = '';
    let currentCharacterIteration = 0;
    let stringLength = primaryInputString.length;
    let differenceMagnitude = 0;
    let squareRootApproximation = 0;
    let signIndicatorChar = '';
    let previousCharacterCodeValue = 0;
    const complexityThreshold = 150;

    const characterCodeArray = Array.from(primaryInputString).map(char => char.charCodeAt(0));

    for (currentCharacterIteration = 0; currentCharacterIteration < stringLength; currentCharacterIteration++) {
        const currentCodePoint = characterCodeArray[currentCharacterIteration];
        differenceMagnitude = currentCodePoint - previousCharacterCodeValue;

        const absoluteDifference = Math.abs(differenceMagnitude);

        if (absoluteDifference === 0) {
            transformedOutputSequence += '.';
            previousCharacterCodeValue = currentCodePoint;
            continue;
        }

        signIndicatorChar = (differenceMagnitude > 0) ? '+' : '-';

        const handleSmallDifference = (diffVal, opChar) => {
            for (let k = 0; k < diffVal; k++) {
                transformedOutputSequence += opChar;
            }
        };

        if (absoluteDifference < complexityThreshold) {
            handleSmallDifference(absoluteDifference, signIndicatorChar);
        } else {
            squareRootApproximation = Math.floor(Math.sqrt(absoluteDifference));

            let complexSegment = '';
            complexSegment += '>';
            complexSegment += generateRepeatedSequence('+', squareRootApproximation);
            complexSegment += '[<';
            complexSegment += generateRepeatedSequence(signIndicatorChar, squareRootApproximation);
            complexSegment += '>-]<';

            const remainingDifference = absoluteDifference - Math.pow(squareRootApproximation, 2);
            complexSegment += generateRepeatedSequence(signIndicatorChar, remainingDifference);

            transformedOutputSequence += complexSegment;
        }
        transformedOutputSequence += '.';
        previousCharacterCodeValue = currentCodePoint;
    }

    console.log(transformedOutputSequence);
}

if (require.main === module) {
    executeTransformationPipeline();
}