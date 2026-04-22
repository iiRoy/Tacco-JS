process.stdin.on('data', function(inputBlob) {
    var sourceData = inputBlob.toString().trim();
    var extractedValues = sourceData.match(/\d+/g);

    var valP = +extractedValues[0];
    var valQ = +extractedValues[1];
    var valR = +extractedValues[2];

    var intermediateCalc = (valQ / valP);
    var adjustedValue = intermediateCalc | 0;

    var ultimateOutcome;
    if (adjustedValue >= valR) {
        ultimateOutcome = valR;
    } else {
        ultimateOutcome = adjustedValue;
    }

    process.stdout.write(ultimateOutcome.toString() + '\n');
});

process.stdin.resume();