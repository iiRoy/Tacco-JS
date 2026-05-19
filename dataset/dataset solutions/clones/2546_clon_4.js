function processInputData(inputPayload) {
    const inputLines = inputPayload.split("\n");

    const [elementCount, windowLength] = inputLines[0].split(" ").map(Number);

    const sourceArray = inputLines[1].split(" ").map(Number);

    const distinctConfigurations = new Set();

    Array.from({ length: elementCount - windowLength + 1 }, (_, currentPosition) => {
        const segment = sourceArray.slice(currentPosition, currentPosition + windowLength);

        segment.sort((aValue, bValue) => aValue - bValue);

        const leadingElements = sourceArray.slice(0, currentPosition);
        const trailingElements = sourceArray.slice(currentPosition + windowLength);
        const reconstructedArray = [...leadingElements, ...segment, ...trailingElements];

        distinctConfigurations.add(reconstructedArray.toString());
    });

    console.log(distinctConfigurations.size);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
