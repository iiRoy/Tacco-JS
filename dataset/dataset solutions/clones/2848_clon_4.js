function processInput(dataString) {
    const lines = dataString.split('\n');
    const countVal = Number(lines[0]);
    const sortedNumbers = lines[1].split(' ').map(Number).sort((a, b) => b - a);

    const midIndex = Math.ceil(countVal / 2);
    const sumOfLargerHalf = sortedNumbers.slice(0, midIndex).reduce((accumulator, current) => accumulator + current, 0);
    const sumOfSmallerHalf = sortedNumbers.slice(midIndex).reduce((accumulator, current) => accumulator + current, 0);
    console.log(sumOfLargerHalf - sumOfSmallerHalf);

    let currentAccumulator;
    let leftCursor = 0;
    let rightCursor = countVal - 1;
    let shouldPickFromLeft;

    if (countVal % 2 === 0) {
        currentAccumulator = sortedNumbers[rightCursor--];
        shouldPickFromLeft = true;
    } else {
        currentAccumulator = sortedNumbers[leftCursor++];
        shouldPickFromLeft = false;
    }

    for (let operationIndex = 0; operationIndex < countVal - 1; operationIndex++) {
        let selectedOperand;
        if (shouldPickFromLeft) {
            selectedOperand = sortedNumbers[leftCursor++];
        } else {
            selectedOperand = sortedNumbers[rightCursor--];
        }
        console.log(`${selectedOperand} ${currentAccumulator}`);
        currentAccumulator = selectedOperand - currentAccumulator;
        shouldPickFromLeft = !shouldPickFromLeft;
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
