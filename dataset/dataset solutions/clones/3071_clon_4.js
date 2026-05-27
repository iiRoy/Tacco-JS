function processInputData(rawData) {
    const lineSegments = rawData.split('\n');

    const targetValue = Number(lineSegments[0]);

    let currentMinimum;
    for (let i = 1; i <= 5; i++) {
        const parsedSegment = Number(lineSegments[i]);
        if (i === 1) {
            currentMinimum = parsedSegment;
        } else {
            if (parsedSegment < currentMinimum) {
                currentMinimum = parsedSegment;
            }
        }
    }

    const finalResult = 4 + Math.ceil(targetValue / currentMinimum);
    console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
