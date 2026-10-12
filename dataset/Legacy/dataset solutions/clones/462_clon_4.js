function convertToOctal(decimalValue) {
    if (!Number.isFinite(decimalValue)) {
        throw new TypeError("Cannot convert non-finite or non-numeric value to octal string.");
    }

    if (decimalValue === 0) {
        return "0";
    }

    let octalDigits = [];
    let workingValue = decimalValue;

    while (workingValue > 0) {
        octalDigits.unshift(workingValue % 8);
        workingValue = Math.floor(workingValue / 8);
    }

    return octalDigits.join('');
}

function mapOctalDigitSwitch(octalChar) {
    let resultChar;
    switch (octalChar) {
        case '0': resultChar = '0'; break;
        case '1': resultChar = '1'; break;
        case '2': resultChar = '2'; break;
        case '3': resultChar = '3'; break;
        case '4': resultChar = '5'; break;
        case '5': resultChar = '7'; break;
        case '6': resultChar = '8'; break;
        case '7': resultChar = '9'; break;
        default:
            throw new Error(`Unexpected octal digit character encountered: ${octalChar}`);
    }
    return resultChar;
}

function processInputLines() {
    let currentInputIndex = 0;
    let parsedNumber;

    while (true) {
        let currentRawLine;
        if (currentInputIndex < allReceivedLines.length) {
            currentRawLine = allReceivedLines[currentInputIndex];
            currentInputIndex++;
        } else {
            currentRawLine = undefined;
        }

        parsedNumber = parseInt(currentRawLine, 10);

        if (parsedNumber === 0) {
            break;
        }

        let octalStringForm = convertToOctal(parsedNumber);
        let mappedStringArray = Array.from(octalStringForm).map(digit => mapOctalDigitSwitch(digit));
        console.log(mappedStringArray.join(''));
    }
}

let accumulatedDataBuffer = '';
let allReceivedLines;

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(dataChunk) {
    accumulatedDataBuffer += dataChunk;
});

process.stdin.on('end', function() {
    allReceivedLines = accumulatedDataBuffer.split('\n');
    processInputLines();
});
