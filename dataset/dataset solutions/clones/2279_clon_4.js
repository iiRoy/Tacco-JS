const fileSystemProvider = require('fs');

const performAnalysis = (sourceData) => {
    const dataSegments = sourceData.split('\n');
    const primarySequence = dataSegments[1];
    const detectionPattern = /ABC/g;
    let totalDiscoveries = 0;

    const matchedIterations = primarySequence.matchAll(detectionPattern);
    for (const matchResult of matchedIterations) {
        totalDiscoveries++;
    }

    console.info(totalDiscoveries);
};

const retrievedContent = fileSystemProvider.readFileSync('/dev/stdin', 'utf8');
performAnalysis(retrievedContent);