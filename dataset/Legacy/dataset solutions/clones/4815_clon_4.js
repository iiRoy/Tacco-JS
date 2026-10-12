function myout(text) {
    console.log(text);
}

function Main(inputContent) {
    const processedLines = inputContent.trim().split('\n');
    const dataLength = Number(processedLines[0]);
    const numberSequence = processedLines[1].split(' ').map(Number);

    const valueCounts = numberSequence.reduce((accumulator, currentNumber) => {
        const existingCount = accumulator.get(currentNumber) || 0;
        if (existingCount < 2) {
            accumulator.set(currentNumber, existingCount + 1);
        }
        return accumulator;
    }, new Map());

    const uniqueSortedNumbers = Array.from(new Set(numberSequence)).sort((a, b) => a - b);

    let calculationResult = 1;
    const isLengthOdd = (dataLength % 2 === 1);

    const validationPassed = uniqueSortedNumbers.every(currentUniqueNumber => {
        const currentNumberFrequency = valueCounts.get(currentUniqueNumber) || 0;

        if (isLengthOdd && currentUniqueNumber === 0) {
            return currentNumberFrequency === 1;
        } else {
            return currentNumberFrequency === 2;
        }
    });

    if (!validationPassed) {
        myout("0");
        return;
    }

    let exponentSourceArray = uniqueSortedNumbers;

    if (isLengthOdd) {
        exponentSourceArray = uniqueSortedNumbers.slice(1);
    }

    calculationResult *= Math.pow(2, exponentSourceArray);
    myout(calculationResult);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
