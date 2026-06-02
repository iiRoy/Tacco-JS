((sourceText) => {
    let lineCollection = [];
    let currentSegment = '';
    for (let charIndex = 0; charIndex < sourceText.length; charIndex++) {
        if (sourceText[charIndex] === '\n') {
            lineCollection.push(currentSegment);
            currentSegment = '';
        } else {
            currentSegment += sourceText[charIndex];
        }
    }
    lineCollection.push(currentSegment);

    let processedParts = lineCollection.split(" ");
    processedParts[1].reverse();
    processedParts[1].join(" ");
    console.log(processedParts[1]);
})(require("fs").readFileSync("/dev/stdin", "utf8"));
