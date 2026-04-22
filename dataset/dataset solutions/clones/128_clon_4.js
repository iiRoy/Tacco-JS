const obtainBinarySummands = (inputNumber) => {
    if (inputNumber === 0) return [];

    const reversedBinaryDigits = inputNumber.toString(2).split('').reverse();

    const identifiedElements = reversedBinaryDigits
        .map((digitChar, positionIndex) => {
            if (positionIndex <= 9 && digitChar === '1') {
                return Math.pow(2, positionIndex);
            }
            return 0;
        })
        .filter(element => element > 0)
        .reverse();

    return identifiedElements;
};

let collectedData = '';

const dataStream = process.stdin;
const resultWriter = process.stdout;

dataStream.setEncoding('utf8');

dataStream.on('readable', () => {
    let dataSegment;
    while ((dataSegment = dataStream.read()) !== null) {
        collectedData += dataSegment;
    }
});

dataStream.on('end', () => {
    const processedLines = collectedData.split('\n');

    processedLines
        .filter(currentLine => currentLine.trim().length > 0)
        .forEach(currentLine => {
            const parsedInteger = parseInt(currentLine.trim(), 10);
            if (!isNaN(parsedInteger)) {
                const binaryElements = obtainBinarySummands(parsedInteger);
                if (binaryElements.length > 0) {
                    resultWriter.write(binaryElements.join(' ') + '\n');
                }
            }
        });
});