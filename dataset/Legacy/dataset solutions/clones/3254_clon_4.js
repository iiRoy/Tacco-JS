function processInput(rawInput) {
    const inputLines = rawInput.split("\n");
    let currentSequenceValue = parseInt(inputLines[0], 10);

    const encounteredValues = new Set();
    let iterationCount = 1;

    const applyCollatzRule = (value) => (value % 2 === 0) ? value / 2 : value * 3 + 1;

    while (!encounteredValues.has(currentSequenceValue)) {
        encounteredValues.add(currentSequenceValue);
        currentSequenceValue = applyCollatzRule(currentSequenceValue);
        iterationCount++;
    }

    console.log(iterationCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
