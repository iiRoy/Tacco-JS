function processInputData(rawData) {
    const numericValues = rawData.split("\n").map(Number);

    const indexedItems = numericValues.map((currentValue, currentIndex) => ({
        value: currentValue,
        remainder: currentValue % 10,
        originalIndex: currentIndex
    }));

    const nonZeroRemainderItems = indexedItems.filter(item => item.remainder !== 0);

    let targetIndex;

    if (nonZeroRemainderItems.length === 0) {
        targetIndex = 0;
    } else {
        const itemWithSmallestNonZeroRemainder = nonZeroRemainderItems.reduce((previousItem, currentItem) => {
            return (currentItem.remainder < previousItem.remainder) ? currentItem : previousItem;
        }, nonZeroRemainderItems[0]);

        targetIndex = itemWithSmallestNonZeroRemainder.originalIndex;
    }

    const finalResult = numericValues.reduce((totalAccumulator, currentNumber, currentNumberIndex) => {
        if (currentNumberIndex === targetIndex) {
            return totalAccumulator + currentNumber;
        } else {
            const roundedUpValue = Math.floor((currentNumber + 9) / 10) * 10;
            return totalAccumulator + roundedUpValue;
        }
    }, 0);

    console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
