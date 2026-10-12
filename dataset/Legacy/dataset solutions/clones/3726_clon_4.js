((sourceText) => {
    const [firstLineContent, ...remainingLines] = sourceText.split('\n');

    let currentOffset = 0;
    let delimiterIndex = firstLineContent.indexOf(' ', currentOffset);
    const firstNumericParam = Number(firstLineContent.substring(currentOffset, delimiterIndex));
    currentOffset = delimiterIndex + 1;
    const secondNumericParam = Number(firstLineContent.substring(currentOffset));

    const sequenceData = remainingLines[0].split(' ').reduce((accumulator, currentElement) => {
        accumulator.push(Number(currentElement));
        return accumulator;
    }, []);

    const finalCalculation = Math.ceil((firstNumericParam - secondNumericParam) / (secondNumericParam - 1)) + 1;

    console.log(finalCalculation);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
