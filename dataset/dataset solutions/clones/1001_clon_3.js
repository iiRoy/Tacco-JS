function main(inputString) {
    const inputLines = inputString.split('\n');

    const parseNumericArrayLine = (lineContent) => lineContent.split(' ').map(Number);

    const arrayLength = Number(inputLines[0]);
    const dataArray = parseNumericArrayLine(inputLines[1]);

    let elementsAlreadySorted = 0;

    const swapCounterReference = { value: 0 };

    const executeBubblePass = (currentArray, sortedBoundary, swapRef) => {
        let passHadSwap = false;
        const loopStartIdx = arrayLength - 1;
        for (let currentIdx = loopStartIdx; currentIdx > sortedBoundary; currentIdx--) {
            if (currentArray[currentIdx] < currentArray[currentIdx - 1]) {
                [currentArray[currentIdx], currentArray[currentIdx - 1]] = [currentArray[currentIdx - 1], currentArray[currentIdx]];
                passHadSwap = true;
                swapRef.value++;
            }
        }
        return passHadSwap;
    };

    while (true) {
        const didAnySwapInPass = executeBubblePass(dataArray, elementsAlreadySorted, swapCounterReference);
        if (!didAnySwapInPass) {
            break;
        }
        elementsAlreadySorted++;
    }

    const totalSwapCount = swapCounterReference.value;

    console.log(dataArray.join(' '));
    console.log(totalSwapCount);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
