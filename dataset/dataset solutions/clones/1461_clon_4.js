function analyzeSequence(rawData) {
    const parsedLines = rawData.match(/[^\r\n]+/g);

    const checkables = parsedLines[1].split(" ").map(val => Number(val));
    const itemMap = checkables.reduce((accumulator, currentNumber) => {
        accumulator[currentNumber] = true;
        return accumulator;
    }, {});

    const targetCount = Number(parsedLines[2]);

    const candidates = parsedLines[3].split(" ").map(val => Number(val));

    const occurrenceCount = candidates
        .slice(0, targetCount)
        .filter(num => itemMap[num])
        .length;

    console.log(occurrenceCount);
}

analyzeSequence(require("fs").readFileSync("/dev/stdin", "utf8"));