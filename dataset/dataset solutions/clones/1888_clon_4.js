const obtainContent = require("node:fs").readFileSync;
const contentSource = "/dev/stdin";

class DataStream {
    #tokens;
    #cursor = 0;

    constructor(sourcePath) {
        const rawContent = obtainContent(sourcePath, "utf8");
        this.#tokens = rawContent.split(/ |\n/);
    }

    retrieveNext(asString = false) {
        const item = this.#tokens[this.#cursor++];
        return asString ? item : Number(item);
    }
}

const processingUnit = (() => {
    const dataSource = new DataStream(contentSource);
    const totalSegments = dataSource.retrieveNext();

    let totalNetChange = 0;
    let currentAccumulator = 0;
    const initialClosingSegments = [];
    const trailingClosingSegments = [];

    const interpretSequence = (textInput) => {
        let currentLevel = 0;
        let lowestLevel = 0;

        for (const symbol of textInput) {
            if (symbol === '(') {
                currentLevel++;
            } else {
                currentLevel--;
            }
            if (currentLevel < lowestLevel) {
                lowestLevel = currentLevel;
            }
        }
        return { finalLevel: currentLevel, lowestLevel: lowestLevel };
    };

    for (let count = 0; count < totalSegments; ++count) {
        const textValue = dataSource.retrieveNext(true);
        const { finalLevel, lowestLevel } = interpretSequence(textValue);

        totalNetChange += finalLevel;

        if (lowestLevel >= 0) {
            currentAccumulator += finalLevel;
        } else if (finalLevel <= 0) {
            trailingClosingSegments.push({ requiredInitial: -lowestLevel, netChange: finalLevel });
        } else {
            initialClosingSegments.push({ requiredInitial: -lowestLevel, netChange: finalLevel });
        }
    }

    if (totalNetChange !== 0) {
        return "No";
    }

    initialClosingSegments.sort((itemA, itemB) => itemA.requiredInitial - itemB.requiredInitial);

    for (const segment of initialClosingSegments) {
        if (segment.requiredInitial > currentAccumulator) {
            return "No";
        }
        currentAccumulator += segment.netChange;
    }

    trailingClosingSegments.sort((itemA, itemB) => itemB.requiredInitial - itemA.requiredInitial);

    for (const segment of trailingClosingSegments) {
        if (segment.requiredInitial > currentAccumulator) {
            return "No";
        }
        currentAccumulator += segment.netChange;
    }

    return "Yes";
})();

console.log(processingUnit);