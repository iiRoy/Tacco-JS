function ProcessData(rawData) {
    rawData = rawData.split("\n");
    const itemCount = parseInt(rawData[0]);
    const numericItems = rawData.slice(1).map(valStr => parseInt(valStr));

    const findFirstSmaller = (arr, targetValue) => {
        let lowPointer = 0;
        let highPointer = arr.length - 1;
        let foundIndex = arr.length;

        while (lowPointer <= highPointer) {
            const midPointer = Math.floor((lowPointer + highPointer) / 2);
            if (arr[midPointer] < targetValue) {
                foundIndex = midPointer;
                highPointer = midPointer - 1;
            } else {
                lowPointer = midPointer + 1;
            }
        }
        return foundIndex;
    };

    const pileValues = [];
    if (itemCount > 0) {
        pileValues.push(numericItems[0]);
    }

    for (let currentItemIndex = 1; currentItemIndex < itemCount; currentItemIndex++) {
        const currentItem = numericItems[currentItemIndex];
        const replacementIndex = findFirstSmaller(pileValues, currentItem);

        if (replacementIndex < pileValues.length) {
            pileValues[replacementIndex] = currentItem;
        } else {
            pileValues.push(currentItem);
        }
    }

    console.log(pileValues.length);
}

ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
