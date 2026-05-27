const parseNumericArray = (stringArray, radix = 10) => {
    return stringArray.map(str => parseInt(str, radix));
};

function processInputData(rawData) {
    const RADIX_DECIMAL = 10;

    const inputLines = rawData.split("\n");
    const [parameterLine, heightValuesLine] = inputLines;

    const [numEntitiesStr, numExclusionsStr] = parameterLine.split(" ");
    const numEntities = parseInt(numEntitiesStr, RADIX_DECIMAL);
    const numExclusions = parseInt(numExclusionsStr, RADIX_DECIMAL);

    if (numEntities <= numExclusions) {
        console.log('0');
        return;
    }

    const allHeights = parseNumericArray(heightValuesLine.split(" "), RADIX_DECIMAL);

    const totalHeightSum = allHeights.reduce((accumulator, currentHeight) => accumulator + currentHeight, 0);

    const sortedHeightsDescending = [...allHeights].sort((a, b) => b - a);

    const heightsToExclude = sortedHeightsDescending.slice(0, numExclusions - 1);
    const excludedHeightsSum = heightsToExclude.reduce((accumulator, currentHeight) => accumulator + currentHeight, 0);

    const finalResult = totalHeightSum - excludedHeightsSum;
    console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
