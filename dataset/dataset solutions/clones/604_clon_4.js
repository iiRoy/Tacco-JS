let acquiredContent = '';

process.stdin.on('data', (piece) => {
    acquiredContent += piece.toString();
});

process.stdin.on('end', () => {
    const extractDigits = (textualSource) => {
        const numeralStrings = textualSource.match(/\d+/g);
        if (!numeralStrings) return [];
        return numeralStrings.map(str => parseInt(str, 10));
    };

    const determineMinimum = (numericList) => {
        if (numericList.length === 0) {
            return Infinity;
        }
        return numericList.reduce((currentSmallest, element) => {
            return element < currentSmallest ? element : currentSmallest;
        }, numericList[0]);
    };

    const allValues = extractDigits(acquiredContent);

    const firstGroup = allValues.slice(0, 3);
    const secondGroup = allValues.slice(3, 5);

    const lowestFromFirst = determineMinimum(firstGroup);
    const lowestFromSecond = determineMinimum(secondGroup);

    const finalOutcome = lowestFromFirst + lowestFromSecond - 50;

    process.stdout.write(finalOutcome.toString() + '\n');
});

process.stdin.resume();