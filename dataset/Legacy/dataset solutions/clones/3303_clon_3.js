function processInputData(rawDataContent) {
    const lines = rawDataContent.split("\n");

    const [itemCountStr, maxWeightStr] = lines[0].split(" ");
    const itemCount = Number.parseInt(itemCountStr);
    const maxWeight = Number.parseInt(maxWeightStr);

    if (itemCount === 0) {
        console.log(0);
        return;
    }

    const parseItemLine = (line) => line.split(" ").map(Number.parseInt);

    const allItems = lines.slice(1, itemCount + 1).map(parseItemLine);

    allItems.sort((a, b) => b[1] - a[1]);

    let currentAccumulatedWeight = 0;
    let currentAccumulatedValue = 0;
    let overallMaxValue = 0;

    for (let leftPointer = 0; leftPointer < itemCount; leftPointer++) {
        const currentItem = allItems[leftPointer];

        currentAccumulatedWeight += currentItem[0];
        currentAccumulatedValue += currentItem[1];

        let rightPointer = leftPointer + 1;

        while (rightPointer < itemCount) {
            const nextItemCandidate = allItems[rightPointer];
            if (currentAccumulatedWeight + nextItemCandidate[0] <= maxWeight) {
                currentAccumulatedWeight += nextItemCandidate[0];
                currentAccumulatedValue += nextItemCandidate[1];
                rightPointer++;
            } else {
                break;
            }
        }

        overallMaxValue = Math.max(currentAccumulatedValue, overallMaxValue);

        currentAccumulatedWeight -= currentItem[0];
        currentAccumulatedValue -= currentItem[1];
    }

    console.log(overallMaxValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
