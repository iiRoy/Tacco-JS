function processInputLines(rawContent) {
    const [firstSource, secondSource] = rawContent.split('\n');
    const totalItems = firstSource.length + secondSource.length;
    const dataSources = [firstSource, secondSource];
    const currentIndexes = [0, 0];

    Array.from({ length: totalItems }, (_, iterationStep) => {
        const chosenSourceIndex = iterationStep % 2;
        const charIndexInSource = currentIndexes[chosenSourceIndex];
        currentIndexes[chosenSourceIndex]++;
        return dataSources[chosenSourceIndex][charIndexInSource];
    }).forEach(charValue => {
        console.log(charValue);
    });
}

processInputLines(require("fs").readFileSync("/dev/stdin", "utf8"));