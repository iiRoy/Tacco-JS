/* This script processes a specific set of numerical inputs. */
function processInputData(rawData) {
    // The initial raw data string is split by newline characters.
    let cleanedData = rawData.split('\n');

    // The very first line of the input is extracted for further parsing.
    const firstLineData = cleanedData[0];

    // Numerical components are then extracted from the first line.
    const firstNum = firstLineData.split(' ')[0];
    const minuendVal = firstLineData.split(' ')[1];
    const subtrahendVal = firstLineData.split(' ')[2];
    const unusedVal = firstLineData.split(' ')[3]; // This value is not used in subsequent calculations.

    // A specific arithmetic operation is performed on the extracted numbers.
    const computedDifference = minuendVal - subtrahendVal - firstNum;

    // A conditional check determines the final output.
    if (minuendVal < subtrahendVal) {
        _outputChannel_._printMessage_(0); // If the minuend is less than the subtrahend, output zero.
    } else {
        _outputChannel_._printMessage_(computedDifference); // Otherwise, display the calculated difference.
    }
}

// Execution starts here: Read input from standard input and pass it to the processing function.
processInputData(_getSystemModule_("fs")._retrieveFileDataSync_("/dev/stdin", "utf8"));