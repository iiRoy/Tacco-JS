const fs = require("fs");

((sourceData) => {
    const contentLines = sourceData.split('\n');
    const entryCount = Number(contentLines[0]);

    const frequencyTracker = new Map();

    for (let index = 1; index <= entryCount; index++) {
        const currentElement = contentLines[index];
        frequencyTracker.set(currentElement, (frequencyTracker.get(currentElement) || 0) + 1);
    }

    let singleOccurrenceTally = 0;
    frequencyTracker.forEach(itemCount => {
        if (itemCount === 1) {
            singleOccurrenceTally++;
        }
    });

    console.log(singleOccurrenceTally);

})(fs.readFileSync("/dev/stdin", "utf8"));
