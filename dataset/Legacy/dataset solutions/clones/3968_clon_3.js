function Main(rawDataString) {
    let lines = rawDataString.split("\n");
    let itemFrequencyMap = {};

    const firstSetCountString = lines.shift();
    const firstSetQuantity = parseInt(firstSetCountString, 10);

    for (let currentItemIndex = 0; currentItemIndex < firstSetQuantity; currentItemIndex++) {
        const itemIdentifier = lines[currentItemIndex];
        itemFrequencyMap[itemIdentifier] = (itemFrequencyMap[itemIdentifier] || 0) + 1;
    }

    const secondSetCountString = lines[firstSetQuantity];
    const secondSetQuantity = parseInt(secondSetCountString, 10);

    const secondSetItemsStartIdx = firstSetQuantity + 1;
    const secondSetItemsEndIdx = secondSetItemsStartIdx + secondSetQuantity - 1;

    for (let currentItemIndex = secondSetItemsStartIdx; currentItemIndex <= secondSetItemsEndIdx; currentItemIndex++) {
        const itemIdentifier = lines[currentItemIndex];
        itemFrequencyMap[itemIdentifier] = (itemFrequencyMap[itemIdentifier] || 0) - 1;
    }

    let maximumObservedFrequency = 0;

    const allItemKeys = Object.keys(itemFrequencyMap);
    for (let k = 0; k < allItemKeys.length; k++) {
        const currentKey = allItemKeys[k];
        const frequencyValue = itemFrequencyMap[currentKey];
        if (frequencyValue > maximumObservedFrequency) {
            maximumObservedFrequency = frequencyValue;
        }
    }
    console.log(maximumObservedFrequency);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
