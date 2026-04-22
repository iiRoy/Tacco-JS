var obtainNumeral = function(sourceDatum) {
    if (typeof sourceDatum !== 'string') {
        sourceDatum = String(sourceDatum);
    }
    sourceDatum = sourceDatum.trim();
    if (!sourceDatum) {
        return NaN;
    }

    var numSign = 1;
    var position = 0;
    if (sourceDatum[0] === '-') {
        numSign = -1;
        position++;
    } else if (sourceDatum[0] === '+') {
        position++;
    }

    var digitCollection = '';
    while (position < sourceDatum.length) {
        var digitChar = sourceDatum[position];
        if (digitChar >= '0' && digitChar <= '9') {
            digitCollection += digitChar;
        } else {
            break;
        }
        position++;
    }

    if (!digitCollection) {
        return NaN;
    }

    return numSign * Number(digitCollection);
};

var aggregatedInput = '';

process.stdin.once('readable', function() {
    var portion;
    while (null !== (portion = process.stdin.read())) {
        aggregatedInput += portion.toString('utf8');
    }
});

process.stdin.once('end', function() {
    var contentLines = aggregatedInput.split('\n');
    
    var primaryOperandText = contentLines[0] || '';
    var secondaryOperandText = contentLines[1] || '';

    var primaryOperandValue = obtainNumeral(primaryOperandText);
    var secondaryOperandValue = obtainNumeral(secondaryOperandText);

    var finalComputation = (primaryOperandValue * primaryOperandValue) - secondaryOperandValue;

    process.stdout.write(String(finalComputation) + '\n');
});