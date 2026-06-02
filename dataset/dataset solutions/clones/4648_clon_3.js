function processInputData(rawTextContent) {
    const lineSegments = rawTextContent.split('\n');
    const firstSegment = lineSegments[0];
    const secondSegment = lineSegments[1];

    const totalIterations = firstSegment.length + secondSegment.length;

    for (let loopCounter = 0; loopCounter < totalIterations; ++loopCounter) {
        const currentSourceSegment = (loopCounter % 2 === 0) ? firstSegment : secondSegment;
        const characterIndex = loopCounter / 2;
        const characterToOutput = currentSourceSegment[characterIndex];
        console.log(characterToOutput);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
