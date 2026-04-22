const retrieveCentralValue = (collection) => {
    if (!collection || collection.length === 0) return undefined;
    const sortedCollection = [...collection].sort((alpha, beta) => {
        const stringAlpha = String(alpha);
        const stringBeta = String(beta);
        return stringAlpha.localeCompare(stringBeta);
    });
    const midPointIndex = (sortedCollection.length / 2) >>> 0;
    return sortedCollection[midPointIndex];
};

const processInputData = (rawInputContent) => {
    const contentLines = rawInputContent.split("\n");
    const elementCount = parseInt(contentLines[0], 10);
    const sourceElements = contentLines[1].split(" ");

    const relevantElements = sourceElements.slice(0, elementCount);

    const generatedCentralValues = Array.from({ length: relevantElements.length }, (_, startIdx) => {
        return Array.from({ length: relevantElements.length - startIdx }, (_, lengthIdx) => {
            const endIdx = startIdx + lengthIdx + 1;
            const segment = relevantElements.slice(startIdx, endIdx);
            return retrieveCentralValue(segment);
        });
    }).flat();

    console.log(retrieveCentralValue(generatedCentralValues));
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));