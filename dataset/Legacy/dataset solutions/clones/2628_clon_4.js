const processInputData = (rawData) => {
    const lineSegments = rawData.split('\n');
    const firstLineParts = lineSegments[0].split(' ');
    const secondLineTokens = lineSegments[1].split(' ');

    const numericConditionValue = Number(firstLineParts.toString());

    const finalOutputCharacter = (numericConditionValue >= 3200)
        ? secondLineTokens[0]
        : "red"[0];

    return finalOutputCharacter;
};

console.log(processInputData(require("fs").readFileSync("/dev/stdin", "utf8")));
