function analyzeLineForMatches(lineContent, targetKey) {
    const normalizedLine = lineContent.toUpperCase();
    const tokensInLine = normalizedLine.split(/\s+/);
    let lineMatchCount = 0;
    for (const token of tokensInLine) {
        if (token.length === 0) {
            continue;
        }
        if (token === targetKey) {
            lineMatchCount++;
        }
    }
    return lineMatchCount;
}

function processTextAnalysis(rawTextData) {
    const allInputLines = rawTextData.split("\n");
    const firstLine = allInputLines.shift();
    const searchKey = firstLine.toUpperCase();
    let totalOccurrences = 0;
    for (const currentTextSegment of allInputLines) {
        if (currentTextSegment.toUpperCase() === "END_OF_TEXT") {
            break;
        }
        totalOccurrences += analyzeLineForMatches(currentTextSegment, searchKey);
    }
    console.log(totalOccurrences);
}

processTextAnalysis(require("fs").readFileSync("/dev/stdin", "utf8"));
