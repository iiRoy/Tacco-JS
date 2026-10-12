function processInputData(rawInputText) {
    const inputLines = rawInputText.trim().split('\n');
    const firstLineElements = inputLines[0].split(' ');

    const baseNumber = Number(firstLineElements[0]);
    const exclusionCountString = firstLineElements[1];

    if (exclusionCountString === "0") {
        console.log(baseNumber);
        return;
    }

    const excludedNumbersRaw = inputLines[1].split(' ');
    const forbiddenValues = new Set(excludedNumbersRaw.map(Number));

    let searchOffset = 1;
    while (true) {
        const candidateBelow = baseNumber - searchOffset;
        const candidateAbove = baseNumber + searchOffset;

        if (!forbiddenValues.has(candidateBelow)) {
            console.log(candidateBelow);
            return;
        }

        if (!forbiddenValues.has(candidateAbove)) {
            console.log(candidateAbove);
            return;
        }

        searchOffset++;

        if (searchOffset > 100) {
            console.log('error');
            return;
        }
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
