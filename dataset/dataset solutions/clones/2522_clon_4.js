function ProcessInput(rawData) {
    const [configurationLine, heightValuesLine] = rawData.split('\n');

    const [_, thresholdHeightString] = configurationLine.split(' '); // First element (member count) is not directly used in the core logic
    const heightThreshold = Number(thresholdHeightString);

    const individualHeights = heightValuesLine.split(' ').map(Number);

    const qualifyingCount = individualHeights.filter(
        (currentValue) => currentValue >= heightThreshold
    ).length;

    console.log(qualifyingCount);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
