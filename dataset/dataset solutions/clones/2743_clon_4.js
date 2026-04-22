function processSequence(inputData) {
    const dividedLines = inputData.split("\n");
    const totalQuantity = parseInt(dividedLines[0]);
    const numericValues = dividedLines.slice(1).map(val => parseInt(val));

    const activeTails = [];

    for (const currentElement of numericValues) {
        let leftBoundary = 0;
        let rightBoundary = activeTails.length;
        let insertionPoint = activeTails.length;

        while (leftBoundary < rightBoundary) {
            const middle = Math.floor((leftBoundary + rightBoundary) / 2);
            if (activeTails[middle] >= currentElement) {
                insertionPoint = middle;
                rightBoundary = middle;
            } else {
                leftBoundary = middle + 1;
            }
        }

        if (insertionPoint === activeTails.length) {
            activeTails.push(currentElement);
        } else {
            activeTails[insertionPoint] = currentElement;
        }
    }

    const finalCount = activeTails.length;
    console.log(finalCount);
}

processSequence(require("fs").readFileSync("/dev/stdin", "utf8"));