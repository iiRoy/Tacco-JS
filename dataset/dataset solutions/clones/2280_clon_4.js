const computeOccurrences = (rawInputData) => {
    const lineSegments = rawInputData.trimEnd().split('\n');
    const numericLimit = Number(lineSegments[0]);
    const targetText = lineSegments[1];

    const searchArea = targetText.slice(0, numericLimit);

    const patternDetector = /(?=(ABC))/g;
    const detectedMatches = searchArea.match(patternDetector);

    const patternCount = detectedMatches ? detectedMatches.length : 0;

    process.stdout.write(String(patternCount) + '\n');
};

computeOccurrences(require('node:fs').readFileSync(0, 'utf8'));