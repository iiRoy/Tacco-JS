function processData(sourceText) {
    const processedContent = sourceText.trim();
    const segments = processedContent.split(" ");

    segments
        .map((segmentValue, currentPosition) => ({
            numericRepresentation: Number(segmentValue),
            oneBasedIndex: currentPosition + 1
        }))
        .filter(item => item.numericRepresentation === 0)
        .forEach(zeroItem => console.log(zeroItem.oneBasedIndex));
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
