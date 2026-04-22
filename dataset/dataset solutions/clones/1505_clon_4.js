const processInputData = (rawTextContent) => {
    const allTextLines = rawTextContent.split('\n');
    const dataLineSegments = allTextLines.slice(1).map(line => line.split(' '));

    const valueTuples = dataLineSegments;

    const resultIndicator = valueTuples.some((currentTuple, positionIndex, fullArray) => {
        if (positionIndex + 2 < fullArray.length) {
            const firstElementComparison = currentTuple[0] === currentTuple[1];
            const secondElementComparison = fullArray[positionIndex + 1][0] === fullArray[positionIndex + 1][1];
            const thirdElementComparison = fullArray[positionIndex + 2][0] === fullArray[positionIndex + 2][1];
            
            return firstElementComparison && secondElementComparison && thirdElementComparison;
        }
        return false;
    });

    process.stdout.write(resultIndicator ? "Yes" : "No");
};

const obtainRawInput = () => {
    return require("node:fs").readFileSync("/dev/stdin", "utf8");
};

processInputData(obtainRawInput());