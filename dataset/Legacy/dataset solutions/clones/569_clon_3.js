let rawData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk) {
  rawData += dataChunk;
});
process.stdin.on('end', function() {
  const processedLines = rawData.split('\n');
  executeProcessing(processedLines);
});

function analyzeStringForPatterns(targetString) {
    const PATTERN_LENGTH = 3;
    const JOI_PATTERN_STR = "JOI";
    const IOI_PATTERN_STR = "IOI";

    let currentJoiCount = 0;
    let currentIoiCount = 0;

    const maxStartIndex = targetString.length - PATTERN_LENGTH;

    for (let segmentStart = 0; segmentStart <= maxStartIndex; segmentStart++) {
        const currentSegment = targetString.substring(segmentStart, segmentStart + PATTERN_LENGTH);
        if (currentSegment === JOI_PATTERN_STR) {
            currentJoiCount++;
        } else if (currentSegment === IOI_PATTERN_STR) {
            currentIoiCount++;
        }
    }
    return { joi: currentJoiCount, ioi: currentIoiCount };
}

function executeProcessing(inputLines) {
    const totalInputLines = inputLines.length;

    for (let lineIndex = 0; lineIndex < totalInputLines; lineIndex++) {
        const lineContent = inputLines[lineIndex];
        const patternCounts = analyzeStringForPatterns(lineContent);
        console.log(patternCounts.joi);
        console.log(patternCounts.ioi);
    }
}
