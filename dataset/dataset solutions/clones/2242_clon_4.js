function ProcessData(rawSequence) {
    const dataElements = rawSequence.split(/\s+/).filter(Boolean).map(Number);
    const [totalItems, initialItemsCount, baseValue] = dataElements;

    const primarySegment = Array(initialItemsCount).fill(baseValue);
    const alternateValue = (baseValue === 1) ? 2 : (baseValue - 1);
    const secondarySegment = Array(totalItems - initialItemsCount).fill(alternateValue);

    const finalOutput = primarySegment.concat(secondarySegment).join(' ');

    console.log(finalOutput);
}
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));