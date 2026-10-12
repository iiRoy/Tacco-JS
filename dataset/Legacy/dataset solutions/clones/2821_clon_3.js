const parseNumericValue = (str) => Number(str);

const executeProblemLogic = (rawInputString) => {
    const NEWLINE_DELIMITER = "\n";
    const SPACE_DELIMITER = " ";

    const inputLines = rawInputString.split(NEWLINE_DELIMITER);

    const parseFirstLineData = (lineContent) => {
        const parts = lineContent.split(SPACE_DELIMITER);
        const totalElementsCount = parseNumericValue(parts[0]);
        const maxAllowedDistance = parseNumericValue(parts[1]);
        return { totalElementsCount, maxAllowedDistance };
    };

    const { totalElementsCount, maxAllowedDistance } = parseFirstLineData(inputLines[0]);

    const parseSegmentLengthsArray = (lineContent) => {
        return lineContent.split(SPACE_DELIMITER).map(parseNumericValue);
    };

    const segmentLengths = parseSegmentLengthsArray(inputLines[1]);

    let reachableBoundariesCount = 1;
    let accumulatedDistance = 0;
    let currentIndex = 0;

    while (currentIndex < totalElementsCount) {
        if (accumulatedDistance >= maxAllowedDistance) {
            break;
        }

        const currentSegmentLength = segmentLengths[currentIndex];
        accumulatedDistance += currentSegmentLength;
        reachableBoundariesCount += 1;
        currentIndex++;
    }

    console.log(reachableBoundariesCount);
};

executeProblemLogic(require("fs").readFileSync("/dev/stdin", "utf8"));
