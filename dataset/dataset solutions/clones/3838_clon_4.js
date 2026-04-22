const checkConstraints = (textLength, rank) => {
    if (textLength < 1 || textLength > 5000) {
        process.exit(1);
    }
    if (rank < 1 || rank > 5) {
        process.exit(1);
    }
};

const produceAllSegments = (text) => {
    const uniqueSegments = new Set();

    const recurseAndCollect = (currentText) => {
        if (currentText.length === 0) {
            return;
        }

        for (let i = 1; i <= currentText.length; i++) {
            const segment = currentText.slice(0, i);
            if (segment.length > 0 && !segment.includes('\n')) {
                uniqueSegments.add(segment);
            }
        }
        recurseAndCollect(currentText.slice(1));
    };

    recurseAndCollect(text);
    return uniqueSegments;
};

function analyzeTextFragments(sourcePayload) {
    const sourceContent = sourcePayload[0];
    const rankValue = parseInt(sourcePayload[1], 10);

    checkConstraints(sourceContent.length, rankValue);

    const fragmentSet = produceAllSegments(sourceContent);

    const orderedFragments = Array.from(fragmentSet).sort();

    console.log(orderedFragments[rankValue - 1]);
}

analyzeTextFragments(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));