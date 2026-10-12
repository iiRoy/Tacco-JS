function processInput(rawData) {
    const lineData = rawData.split('\n');
    const [_, selectionSize] = lineData[0].split(' ').map(Number);
    const numericValues = lineData[1].split(' ').map(Number);

    let selectedValues = numericValues.slice(0, selectionSize);
    selectedValues.sort((x, y) => x - y);

    for (let idx = selectionSize; idx < numericValues.length; ++idx) {
        const currentValue = numericValues[idx];
        if (currentValue < selectedValues[selectionSize - 1]) {
            selectedValues[selectionSize - 1] = currentValue;
            selectedValues.sort((x, y) => x - y);
        }
    }

    const totalSum = selectedValues.reduce((accumulator, current) => accumulator + current, 0);

    console.log(totalSum);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
