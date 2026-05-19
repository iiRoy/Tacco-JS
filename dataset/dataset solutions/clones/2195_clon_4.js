function processInput(rawData) {
    const dataLines = rawData.split("\n");

    const parameterTokens = dataLines[0].split(" ");
    const entityCount = Number(parameterTokens[0]);
    const removalCount = Number(parameterTokens[1]);

    if (entityCount <= removalCount) {
        console.log('0');
    } else {
        const itemValues = dataLines[1].split(" ").map(Number);

        itemValues.sort((firstElement, secondElement) => firstElement - secondElement);

        const elementsToSumCount = entityCount - (removalCount - 1);

        const finalSum = itemValues.slice(0, elementsToSumCount)
                                   .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

        console.log(finalSum);
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
