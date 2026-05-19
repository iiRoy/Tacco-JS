function processInputString(initialString) {
    const patternsToEliminate = ["eraser", "erase", "dreamer", "dream"];
    let currentProcessedString = initialString;

    for (const patternSegment of patternsToEliminate) {
        const removalRegex = new RegExp(patternSegment, 'g');
        currentProcessedString = currentProcessedString.replace(removalRegex, '');
    }

    if (currentProcessedString === '') {
        console.log("YES");
    } else {
        console.log("NO");
    }
}
processInputString(require("fs").readFileSync("/dev/stdin", "utf8"));
