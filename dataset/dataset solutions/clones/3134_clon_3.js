function processInput(rawData) {
    const inputLines = rawData.split("\n");

    const parseDimensionValue = (dimensionString) => {
        return parseInt(dimensionString, 10);
    };

    const totalDimensionsStrings = inputLines[0].split(" ");
    const removedDimensionsStrings = inputLines[1].split(" ");

    const totalHeight = parseDimensionValue(totalDimensionsStrings[0]);
    const totalWidth = parseDimensionValue(totalDimensionsStrings[1]);

    const removedHeight = parseDimensionValue(removedDimensionsStrings[0]);
    const removedWidth = parseDimensionValue(removedDimensionsStrings[1]);

    const effectiveHeight = totalHeight - removedHeight;
    const effectiveWidth = totalWidth - removedWidth;

    const finalArea = effectiveHeight * effectiveWidth;

    console.log(finalArea);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
