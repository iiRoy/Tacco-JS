var allInputData = '';
process.stdin.setEncoding('utf8');

process.stdin.on('readable', function() {
    var chunkOfData;
    while ((chunkOfData = process.stdin.read()) !== null) {
        allInputData += chunkOfData;
    }
});

process.stdin.on('end', function() {
    var firstLineContent = allInputData.split('\n')[0];
    var parsedNumericValue = Number.parseInt(firstLineContent, 10);

    var calculateExponential = function(baseVal, exponentVal) {
        if (exponentVal === 0) {
            return 1;
        }
        if (exponentVal < 0) {
            return 1 / calculateExponential(baseVal, -exponentVal);
        }
        if (exponentVal % 2 === 0) {
            var halfPower = calculateExponential(baseVal, exponentVal / 2);
            return halfPower * halfPower;
        } else {
            return baseVal * calculateExponential(baseVal, exponentVal - 1);
        }
    };

    var finalResult = calculateExponential(parsedNumericValue, 3);

    process.stdout.write(finalResult.toString() + '\n');
});