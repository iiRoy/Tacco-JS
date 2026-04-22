function processData(rawPayload) {
    const numberTokens = rawPayload.split('\n')[1].split(' ');
    const initialNumbers = numberTokens.map(Number);

    function calculateAggregatedSum(currentNumbers) {
        if (currentNumbers.length === 2) {
            return currentNumbers[0] + currentNumbers[1];
        }

        const [firstElement, middleElement, thirdElement, ...remainingElements] = currentNumbers;

        const newFirst = firstElement + middleElement;
        const newSecond = thirdElement + middleElement;

        return calculateAggregatedSum([newFirst, newSecond, ...remainingElements]);
    }

    const finalResult = calculateAggregatedSum(initialNumbers);
    console.log(finalResult);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));