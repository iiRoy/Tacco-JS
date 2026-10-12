function processInput(rawData) {
    const [initialSegment, targetSequence] = rawData.split("\n");
    const segmentLength = initialSegment.length;

    const isPrefixMatch = Array.from(initialSegment).every((char, index) => {
        return char === targetSequence[index];
    });

    console.log(isPrefixMatch ? "Yes" : "No");
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
