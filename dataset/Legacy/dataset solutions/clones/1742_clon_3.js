function ProcessData(dataString) {
    const lines = dataString.split("\n");

    const firstLineValues = lines[0].split(" ");
    const valN = firstLineValues[0];
    const numElementsToSum = parseInt(firstLineValues[1], 10);

    const rawNumberStrings = lines[1].split(" ");

    const expectedNumElements = parseInt(valN, 10);
    const numericValues = [];
    for (let idx = 0; idx < expectedNumElements; idx++) {
        const currentStringValue = rawNumberStrings[idx];
        numericValues[idx] = parseInt(currentStringValue, 10);
    }

    const customAscendingSort = (elementA, elementB) => {
        return (elementA < elementB ? -1 : 1);
    };

    numericValues.sort(customAscendingSort);

    let currentTotal = 0;
    for (let idx = 0; idx < numElementsToSum; idx++) {
        const elementForSum = numericValues[idx];
        currentTotal += elementForSum;
    }

    console.log(currentTotal);
}

ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
