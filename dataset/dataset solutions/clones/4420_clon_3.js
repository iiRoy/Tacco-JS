function processInputData(rawDataString) {
    const rawParts = rawDataString.split(" ");
    const lowerBoundA = Number(rawParts[0]);
    const upperBoundA = Number(rawParts[1]);
    const lowerBoundB = Number(rawParts[2]);
    const upperBoundB = Number(rawParts[3]);

    let matchingCount = 0;

    const checkRangeInclusion = (valueToCheck, minBound, maxBound) => {
        return valueToCheck >= minBound && valueToCheck <= maxBound;
    };

    for (let currentValue = lowerBoundA; currentValue <= upperBoundA; currentValue++) {
        if (checkRangeInclusion(currentValue, lowerBoundB, upperBoundB)) {
            matchingCount++;
        }
    }

    console.log(matchingCount);
}

const getStandardInputContent = () => {
    return require("fs").readFileSync("/dev/stdin", "utf8");
};

processInputData(getStandardInputContent());
