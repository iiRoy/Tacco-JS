function processInput(rawData) {
    const lines = rawData.split("\n");

    const sourceLine = lines[0];
    const targetLine = lines[1];

    const sourceChars = sourceLine.split("");
    const targetChars = targetLine.split("");

    const initialMaxMismatch = 1001;
    let minMismatchOverall = initialMaxMismatch;

    const maxOuterLoopIterations = sourceChars.length - targetChars.length + 1;

    for (let outerIndex = 0; outerIndex < maxOuterLoopIterations; outerIndex++) {
        let currentMismatchCount = 0;
        const currentWindowStart = outerIndex;

        for (let innerIndex = 0; innerIndex < targetChars.length; innerIndex++) {
            const sourceCharInWindow = sourceChars[currentWindowStart + innerIndex];
            const targetChar = targetChars[innerIndex];

            if (sourceCharInWindow !== targetChar) {
                currentMismatchCount += 1;
            }
        }

        if (currentMismatchCount < minMismatchOverall) {
            minMismatchOverall = currentMismatchCount;
        }
    }

    console.log(minMismatchOverall);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
