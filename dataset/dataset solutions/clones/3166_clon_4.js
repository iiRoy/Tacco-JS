var collectedInput = [];
var inputSource = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

function evaluateDateCondition(dateRepresentation) {
    const isPurelyNumeric = /^\d+$/.test(dateRepresentation);
    if (!isPurelyNumeric) {
        return false;
    }

    const targetNumericString = '20190430';

    const inputLength = dateRepresentation.length;
    const targetLength = targetNumericString.length;

    if (inputLength < targetLength) {
        return true;
    }
    if (inputLength > targetLength) {
        return false;
    }

    return dateRepresentation <= targetNumericString;
}

inputSource.on('line', function (currentLine) {
    collectedInput.push(currentLine);
});

inputSource.on('close', function () {
    const finalResult = (function() {
        if (collectedInput.length !== 1) {
            return 'TBD';
        }

        const rawInputLine = collectedInput[0];
        const processedDateString = rawInputLine.replace(/\//g, '');

        if (evaluateDateCondition(processedDateString)) {
            return 'Heisei';
        } else {
            return 'TBD';
        }
    })();

    console.log(finalResult);
});
