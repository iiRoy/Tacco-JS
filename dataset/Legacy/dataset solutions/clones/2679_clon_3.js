function isStringLengthOdd(numericValue) {
    var stringRepresentation = String(numericValue);
    var stringLength = stringRepresentation.length;
    return stringLength % 2 === 1;
}

function processData(rawInputString) {
    var parsedArguments = rawInputString.split(' ');
    var firstArgument = parsedArguments[0];
    var limitValue = parseInt(firstArgument, 10);

    var resultCounter = 0;

    for (var currentIterationValue = 1; currentIterationValue <= limitValue; currentIterationValue++) {
        if (isStringLengthOdd(currentIterationValue)) {
            resultCounter++;
        }
    }

    console.log(resultCounter);
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
