function processInput(dataStream) {
    const [firstLineContent, secondLineContent] = dataStream.split('\n');
    const [eventCount, timeLimit] = firstLineContent.split(' ').map(Number);
    const triggerPoints = secondLineContent.split(' ').map(Number);

    let cumulativeDuration = 0;

    if (eventCount > 0) {
        cumulativeDuration = Math.min(triggerPoints[0], timeLimit);

        cumulativeDuration += triggerPoints.slice(1).reduce((acc, currentPoint, index) => {
            const priorPoint = triggerPoints[index];
            const intervalSpan = currentPoint - priorPoint;
            return acc + Math.min(intervalSpan, timeLimit);
        }, 0);
    }

    cumulativeDuration += timeLimit;
    console.log(cumulativeDuration);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
