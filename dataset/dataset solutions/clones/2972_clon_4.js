function retrieveNumericParameters(sourceContent) {
    const contentLines = sourceContent.trim().split('\n');
    const primaryParameter = Number(contentLines[0]);
    const secondaryParameter = Number(contentLines[1]);
    return { primaryParameter, secondaryParameter };
}

function constructNumericSeries(rangeIndicator) {
    if (rangeIndicator < 0) {
        return [];
    }
    const upperLimit = 1 << rangeIndicator;
    const ascendingPart = Array.from({ length: upperLimit }, (_, elementIndex) => elementIndex);
    const descendingPart = Array.from({ length: upperLimit }, (_, elementIndex) => upperLimit - 1 - elementIndex);
    return ascendingPart.concat(descendingPart);
}

function processComputationalTask(taskConfiguration) {
    const { primaryParameter, secondaryParameter } = taskConfiguration;

    if (secondaryParameter === 0) {
        const resultingSequence = constructNumericSeries(primaryParameter);
        console.log(resultingSequence.join(' '));
    } else {
        console.log('-1');
    }
}

const inputSource = require("fs").readFileSync("/dev/stdin", "utf8");
const parsedConfiguration = retrieveNumericParameters(inputSource);
processComputationalTask(parsedConfiguration);