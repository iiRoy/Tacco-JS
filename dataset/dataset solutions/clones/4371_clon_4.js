function analyzeSequence(sourceText) {
    const textLines = sourceText.split(/\r?\n/).filter(Boolean);
    const elementCount = parseInt(textLines[0], 10);
    const numericElements = textLines.slice(1, elementCount + 1).map(val => parseInt(val, 10));

    const frequencyMap = new Map();
    for (const currentVal of numericElements) {
        frequencyMap.set(currentVal, (frequencyMap.get(currentVal) || 0) + 1);
    }

    let resultSum = 0;
    for (const count of frequencyMap.values()) {
        if (count % 2 !== 0) {
            resultSum++;
        }
    }
    console.log(resultSum);
}

analyzeSequence(require("fs").readFileSync("/dev/stdin", "utf8"));