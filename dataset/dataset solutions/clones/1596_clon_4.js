function processTextData(rawText) {
    const processedString = rawText.trim();
    const rSequences = processedString.split(/[^R]+/).filter(Boolean);

    const greatestLength = rSequences.reduce((currentMax, sequence) => {
        return Math.max(currentMax, sequence.length);
    }, 0);

    const finalOutcome = Math.min(greatestLength, 3);
    console.log(finalOutcome);
}

processTextData(require("fs").readFileSync("/dev/stdin", "utf8"));