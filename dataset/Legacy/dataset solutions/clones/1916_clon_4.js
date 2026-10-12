function processInput(dataPayload) {
    const [firstLineContent, secondLineContent] = dataPayload.split('\n');
    const numericalDivisor = Number(firstLineContent);
    const [rangeStart, rangeEnd] = secondLineContent.split(' ').map(Number);

    const collectedOutputs = [];

    if (rangeStart === rangeEnd) {
        collectedOutputs.push('OK');
    } else {
        const numberSequence = Array.from({ length: rangeEnd - rangeStart + 1 }, (_, indexOffset) => rangeStart + indexOffset);

        numberSequence
            .filter(currentValue => currentValue % numericalDivisor === 0)
            .forEach(() => collectedOutputs.push('OK'));
    }

    collectedOutputs.forEach(messageItem => console.log(messageItem));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
