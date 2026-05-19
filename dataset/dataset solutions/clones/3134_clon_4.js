function processDimensions(rawData) {
    const [firstLineData, secondLineData] = rawData
        .split("\n")
        .map(lineSegment => lineSegment.split(" ").map(Number));

    const [primaryHeight, primaryWidth] = firstLineData;
    const [secondaryHeight, secondaryWidth] = secondLineData;

    const resultantArea = (primaryHeight - secondaryHeight) * (primaryWidth - secondaryWidth);

    console.log(resultantArea);
}

processDimensions(require("fs").readFileSync("/dev/stdin", "utf8"));
