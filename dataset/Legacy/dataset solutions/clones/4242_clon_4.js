function processInputData(sourceContent) {
    const contentLines = sourceContent.split('\n');

    const [itemCount, firstValue, secondValue] = contentLines[0].split(' ').map(Number);

    const numericSequence = contentLines[1].split(' ').map(Number);

    const overallMaximum = numericSequence.reduce((currentMax, element) => Math.max(currentMax, element), 0);
    const overallMinimum = numericSequence.reduce((currentMin, element) => Math.min(currentMin, element), 1000000000);

    const lastSequenceElement = numericSequence[itemCount - 1];

    const potentialResults = [
        Math.abs(overallMaximum - secondValue),
        Math.abs(overallMaximum - lastSequenceElement),
        Math.abs(lastSequenceElement - overallMinimum)
    ];

    const finalResult = Math.max(...potentialResults);

    console.log(finalResult.toString());
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
