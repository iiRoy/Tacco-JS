const computeResult = (rawInputContent) => {
    const lineSegments = rawInputContent.split('\n');
    const numericParameters = lineSegments[0].split(' ').map(Number);
    const initialSequence = lineSegments[1].split(' ').map(Number);

    const fullLength = numericParameters[0];
    const subsegmentLength = numericParameters[1];

    const elementOrderComparator = (firstVal, secondVal) => firstVal - secondVal;

    const recordedConfigurations = {};

    Array.from({ length: fullLength - subsegmentLength + 1 }, (_, windowPosition) => {
        const precedingElements = initialSequence.slice(0, windowPosition);
        const currentWindow = initialSequence.slice(windowPosition, windowPosition + subsegmentLength);
        const sortedWindow = [...currentWindow].sort(elementOrderComparator);
        const succeedingElements = initialSequence.slice(windowPosition + subsegmentLength);

        const constructedLayout = [...precedingElements, ...sortedWindow, ...succeedingElements];
        const layoutIdentifier = JSON.stringify(constructedLayout);
        recordedConfigurations[layoutIdentifier] = true;
    });

    return Object.keys(recordedConfigurations).length;
};

console.log(computeResult(require("fs").readFileSync("/dev/stdin", "utf8")));