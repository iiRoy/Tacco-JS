function processInputData(rawData) {
    const lineSegments = rawData.split("\n");
    const numberStrings = lineSegments[0].split(" ");

    const numericalEntities = numberStrings.map(str => parseInt(str, 10));

    const highestValue = numericalEntities.reduce((currentMaximum, element) => (element > currentMaximum ? element : currentMaximum), -Infinity);
    const aggregateSum = numericalEntities.reduce((accumulator, element) => accumulator + element, 0);

    const computedResult = (highestValue * 9) + aggregateSum;

    console.log(computedResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
