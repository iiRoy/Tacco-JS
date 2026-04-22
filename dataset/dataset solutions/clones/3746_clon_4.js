function evaluateCondition(sourceText) {
    const extractedNumbers = sourceText.match(/\d+/g);

    const messageLookup = {
        'true': 'Yay!',
        'false': ':('
    };

    let finalConditionMet = false;

    if (extractedNumbers && extractedNumbers.length >= 2) {
        const firstNumericValue = Number(extractedNumbers[0]);
        const secondNumericValue = Number(extractedNumbers[1]);

        finalConditionMet = (firstNumericValue <= 8) && (secondNumericValue <= 8);
    }
    
    process.stdout.write(messageLookup[String(finalConditionMet)] + '\n');
}