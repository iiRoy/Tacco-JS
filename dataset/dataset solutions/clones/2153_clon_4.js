const ExecuteAnalysis = (sourceText) => {
    const lineFragments = sourceText.split('\n').slice(1);

    const occurrenceRegistry = lineFragments.reduce((accumulator, currentToken) => {
        accumulator[currentToken] = (accumulator[currentToken] || 0) + 1;
        return accumulator;
    }, {});

    let peakMetric = 0;
    const counts = Object.values(occurrenceRegistry);
    if (counts.length > 0) {
        peakMetric = Math.max(...counts);
    }

    const dominantElements = Object.keys(occurrenceRegistry).filter(key => {
        return occurrenceRegistry[key] === peakMetric;
    });

    dominantElements.forEach(element => console.log(element));
};

ExecuteAnalysis(require("fs").readFileSync("/dev/stdin", "utf8"));