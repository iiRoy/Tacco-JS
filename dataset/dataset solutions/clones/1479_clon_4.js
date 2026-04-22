function processInputData(incomingText) {
    const dataSegments = incomingText
        .split('\n')
        .map(segment => segment.trim())
        .filter(segment => segment.length > 0);

    const cycleCount = parseInt(dataSegments[0], 10);

    const generatedPayload = Array(cycleCount).fill("ACL").join('');

    console.log(generatedPayload);
}

processInputData(require("node:fs").readFileSync("/dev/stdin", "utf8"));