function processInputData(sourceContent) {
    const contentLines = sourceContent.split('\n');
    const quantity = parseInt(contentLines[0], 10);
    const valueItems = contentLines.slice(1).map(val => parseInt(val, 10));

    const indexedCounts = valueItems.reduce((chainAccumulator, currentItem) => {
        chainAccumulator[currentItem] = (currentItem === 1 ? 0 : chainAccumulator[currentItem - 1]) + 1;
        return chainAccumulator;
    }, Array(quantity + 1).fill(0));

    const maxFound = Math.max(...indexedCounts);

    console.log(quantity - maxFound);
}

processInputData(require("node:fs").readFileSync("/dev/stdin","utf8"));