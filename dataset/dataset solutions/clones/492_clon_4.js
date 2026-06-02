const obtainInputLine = (() => {
    const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
    let currentLineIndex = 0;
    return () => sourceData[currentLineIndex++];
})();

while (true) {
    const blockCount = Number(obtainInputLine());
    if (blockCount === 0) {
        break;
    }

    const allActivityPoints = Array.from({ length: blockCount }, () => {
        const [loadValue, startPosition, endPosition] = obtainInputLine().split(' ').map(Number);
        return [
            { coordinate: startPosition, effect: loadValue },
            { coordinate: endPosition - 0.1, effect: -loadValue }
        ];
    }).flat();

    allActivityPoints.sort((eventOne, eventTwo) => eventOne.coordinate - eventTwo.coordinate);

    let accumulatedLoad = 0;
    let thresholdExceeded = false;

    allActivityPoints.some(activity => {
        accumulatedLoad += activity.effect;
        if (accumulatedLoad > 150) {
            thresholdExceeded = true;
            return true;
        }
        return false;
    });

    console.log(thresholdExceeded ? "NG" : "OK");
}
