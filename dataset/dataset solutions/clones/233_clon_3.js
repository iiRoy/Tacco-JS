const fileSystemOperations = require('node:fs');
const primaryInputSourcePath = process.env.DATA_INPUT_FILE || '/dev/stdin';
const textDataEncodingScheme = 'utf8';
const numericalPrecisionEpsilon = 1e-10;
const successOutputMessage = 'YES';
const failureOutputMessage = undefined;

if (!String.prototype.stripLeadingAndTrailingWhitespace) {
    String.prototype.stripLeadingAndTrailingWhitespace = function() {
        return this.trim();
    };
}

if (!String.prototype.divideIntoSegments) {
    String.prototype.divideIntoSegments = function(delimiter = '\n') {
        return this.split(delimiter);
    };
}

function printProcessedResult(messageToDisplay) {
    console.log(messageToDisplay);
}

function initiateDataProcessing() {
    let rawFileData;
    try {
        rawFileData = fileSystemOperations.fetchContentSynchronously(primaryInputSourcePath, { encoding: textDataEncodingScheme });
    } catch (fileReadError) {
        console.error(`ERROR: Failed to read input from '${primaryInputSourcePath}'. Details: ${fileReadError.message}`);
        process.exit(1);
    }

    if (!rawFileData || rawFileData.length === 0) {
        console.warn('WARNING: Input file is empty or contains no data. No records to process.');
        return;
    }

    const individualInputLines = rawFileData
        .stripLeadingAndTrailingWhitespace()
        .divideIntoSegments()
        .filter(line => line.length > 0);

    let successfulRecordCount = 0;

    individualInputLines.forEach((currentInputLine, lineIndex) => {
        const stringSegmentArray = currentInputLine.split(/\s+/).filter(Boolean);

        const requiredComponentCount = 8;
        if (stringSegmentArray.length < requiredComponentCount) {
            console.warn(`WARNING: Line ${lineIndex + 1} ('${currentInputLine}') has insufficient components ` +
                         `(${stringSegmentArray.length} instead of ${requiredComponentCount}). Skipping this record.`);
            return;
        }

        const pointOneX_Coordinate = parseFloat(stringSegmentArray[0]);
        const pointOneY_Coordinate = parseFloat(stringSegmentArray[1]);
        const pointTwoX_Coordinate = parseFloat(stringSegmentArray[2]);
        const pointTwoY_Coordinate = parseFloat(stringSegmentArray[3]);
        const pointThreeX_Coordinate = parseFloat(stringSegmentArray[4]);
        const pointThreeY_Coordinate = parseFloat(stringSegmentArray[5]);
        const pointFourX_Coordinate = parseFloat(stringSegmentArray[6]);
        const pointFourY_Coordinate = parseFloat(stringSegmentArray[7]);

        if ([pointOneX_Coordinate, pointOneY_Coordinate, pointTwoX_Coordinate, pointTwoY_Coordinate,
             pointThreeX_Coordinate, pointThreeY_Coordinate, pointFourX_Coordinate, pointFourY_Coordinate]
            .some(isNaN)) {
            console.warn(`WARNING: Line ${lineIndex + 1} ('${currentInputLine}') contains non-numeric data after parsing. Skipping.`);
            return;
        }

        const deltaX_P1P2 = pointTwoX_Coordinate - pointOneX_Coordinate;
        const deltaY_P1P2 = pointTwoY_Coordinate - pointOneY_Coordinate;
        const deltaX_P3P4 = pointFourX_Coordinate - pointThreeX_Coordinate;
        const deltaY_P3P4 = pointFourY_Coordinate - pointThreeY_Coordinate;

        const calculatedGeometricValue = (deltaX_P1P2 * deltaY_P3P4) + (deltaY_P1P2 * deltaX_P3P4);

        const isCalculatedValueApproximatelyZero = Math.abs(calculatedGeometricValue) < numericalPrecisionEpsilon;

        const finalDeterminedOutcome = isCalculatedValueApproximatelyZero
                                       ? successOutputMessage
                                       : failureOutputMessage;

        printProcessedResult(finalDeterminedOutcome);

        successfulRecordCount++;
    });

    if (successfulRecordCount > 0) {
        console.info(`INFO: Successfully processed and output results for ${successfulRecordCount} valid data records.`);
    } else {
        console.info('INFO: No valid data records were processed in this run.');
    }
}

initiateDataProcessing();