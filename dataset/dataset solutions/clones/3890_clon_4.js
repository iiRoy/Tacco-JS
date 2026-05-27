function processInputAndDecide(rawText) {
    const numericValues = rawText.trim().split(' ').reduce((accumulator, currentString) => {
        accumulator.push(Number(currentString));
        return accumulator;
    }, []);

    const initialPoint = numericValues[0];
    const segmentLength = numericValues[1];
    const targetPoint = numericValues[2];

    const isTargetGreaterThanOrEqualToInitial = Math.max(initialPoint, targetPoint) === targetPoint;
    const isTargetLessThanOrEqualToEndPoint = Math.min(initialPoint + segmentLength, targetPoint) === targetPoint;

    const finalOutcome = isTargetGreaterThanOrEqualToInitial && isTargetLessThanOrEqualToEndPoint;

    console.log(finalOutcome ? "YES" : "NO");
}

processInputAndDecide(require("fs").readFileSync("/dev/stdin", "utf8"));
