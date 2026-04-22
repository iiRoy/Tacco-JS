const sourceFetcher = () => {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim();
};

const processData = (rawTextualData) => {
    const contentLines = rawTextualData.split(/\r?\n/);
    const firstLineElements = contentLines[0].split(/\s+/).map(segment => parseInt(segment, 10));
    const targetLimit = firstLineElements[1];
    const secondLineElements = contentLines[1].split(/\s+/);

    const itemFrequencies = secondLineElements.reduce((accumulator, currentElement) => {
        accumulator.set(currentElement, (accumulator.get(currentElement) || 0) + 1);
        return accumulator;
    }, new Map());

    const sortedQuantities = Array.from(itemFrequencies.values()).sort((valA, valB) => {
        return (valA < valB) ? -1 : ((valA > valB) ? 1 : 0);
    });

    const distinctItemCount = sortedQuantities.length;

    const cumulativeWeight = (distinctItemCount <= targetLimit)
        ? 0
        : sortedQuantities.slice(0, distinctItemCount - targetLimit)
            .reduce((totalAccumulation, frequencyValue) => totalAccumulation + frequencyValue, 0);

    console.log(cumulativeWeight);
};

processData(sourceFetcher());