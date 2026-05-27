function calculateCommonDivisor(valA, valB) {
    let currentA = valA;
    let currentB = valB;
    while (currentB !== 0) {
        let remainder = currentA % currentB;
        currentA = currentB;
        currentB = remainder;
    }
    return currentA;
}

function determineArrayGcd(numberList) {
    if (numberList.length === 0) {
        return 0;
    }
    return numberList.reduce((accumulator, currentElement) => {
        return calculateCommonDivisor(accumulator, currentElement);
    });
}

function processInputData(rawInput) {
    const lines = rawInput.split('\n');
    const firstLineNumbers = lines[0].split(' ').map(Number);
    const referencePoint = firstLineNumbers[1];

    const secondLineNumbers = lines[1].split(' ').map(Number);

    const absoluteDifferences = secondLineNumbers.map(value => Math.abs(referencePoint - value));

    console.log(determineArrayGcd(absoluteDifferences));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
