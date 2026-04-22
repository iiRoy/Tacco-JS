const findSpecificDigit = (numericalValue, soughtDigit) => {
    if (numericalValue === 0) {
        return soughtDigit === 0;
    }
    if (numericalValue < 0) {
        numericalValue = -numericalValue;
    }
    if (numericalValue % 10 === soughtDigit) {
        return true;
    }
    const remaining = Math.trunc(numericalValue / 10);
    if (remaining === 0) {
        return false;
    }
    return findSpecificDigit(remaining, soughtDigit);
};

const evaluateCriteria = (item) => {
    const isPerfectDivisibleByThree = (item / 3 === Math.trunc(item / 3));
    const containsTargetDigit = findSpecificDigit(item, 3);
    return isPerfectDivisibleByThree || (!isPerfectDivisibleByThree && containsTargetDigit);
};

const obtainNumericInput = () => {
    return new Promise(response => {
        let gatheredContent = '';
        process.stdin.on('data', piece => {
            gatheredContent += piece.toString();
        });
        process.stdin.on('end', () => {
            response(Number.parseInt(gatheredContent.trim(), 10));
        });
    });
};

obtainNumericInput().then(upperBound => {
    const sequence = Array.from({ length: upperBound - 2 }, (_, index) => index + 3);

    const resultingSequence = sequence.filter(evaluateCriteria);

    const outputText = resultingSequence.join(' ');

    process.stdout.write(outputText + '\n');
});