const fileSystemModule = require('fs');

const numericSequenceExtractor = (textualData) => {
    let currentDigitAccumulator = '';
    const extractedNumbers = [];

    for (let characterDatum of textualData) {
        if (characterDatum >= '0' && characterDatum <= '9') {
            currentDigitAccumulator += characterDatum;
        } else {
            if (currentDigitAccumulator.length > 0) {
                extractedNumbers.push(Number.parseInt(currentDigitAccumulator, 10));
                currentDigitAccumulator = '';
            }
        }
    }

    if (currentDigitAccumulator.length > 0) {
        extractedNumbers.push(Number.parseInt(currentDigitAccumulator, 10));
    }

    return extractedNumbers;
};

try {
    const completeInputText = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    const numericalComponents = numericSequenceExtractor(completeInputText);
    const finalAggregation = numericalComponents.reduce((summation, valueItem) => summation + valueItem, 0);
    process.stdout.write(finalAggregation.toString() + '\n');
} catch (operationalFault) {
    process.stderr.write('An error occurred during processing: ' + operationalFault.message + '\n');
    process.exit(1);
}