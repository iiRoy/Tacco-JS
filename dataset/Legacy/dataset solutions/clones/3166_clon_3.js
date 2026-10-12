var receivedLines = [];
var inputProcessor = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

inputProcessor.on('line', function (currentInputLine) {
    receivedLines.push(currentInputLine);
});

inputProcessor.on('close', function () {
    const HEISEI_ERA_END_DATE_STRING = '20190430';
    let outputMessage = 'TBD';

    const evaluateDateForEra = (dateInputString) => {
        const processedDateString = dateInputString.replace(/\//g, '');
        // The original code performs a string comparison here.
        // '20190430' as a number literal is coerced to a string for comparison.
        return processedDateString <= HEISEI_ERA_END_DATE_STRING;
    };

    const hasSingleInputLine = receivedLines.length === 1;

    if (hasSingleInputLine) {
        const firstLineOfInput = receivedLines[0];
        if (evaluateDateForEra(firstLineOfInput)) {
            outputMessage = 'Heisei';
        }
    }

    console.log(outputMessage);
});
