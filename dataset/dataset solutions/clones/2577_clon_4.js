function processInputData(rawData) {
    const lineSegments = rawData.split("\n");
    const firstLineValues = lineSegments[0].split(' ').map(val => parseInt(val, 10));
    const elementCount = firstLineValues[0];
    const valueSequence = lineSegments[1].split(' ').map(val => parseInt(val, 10));

    const initialTerm = valueSequence[0];
    const finalTerm = valueSequence[elementCount - 2];

    const middleSum = valueSequence.slice(0, elementCount - 2).reduce((accumulator, _, index) => {
        return accumulator + Math.min(valueSequence[index], valueSequence[index + 1]);
    }, 0);

    const cumulativeSum = initialTerm + middleSum + finalTerm;

    console.log(cumulativeSum);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
