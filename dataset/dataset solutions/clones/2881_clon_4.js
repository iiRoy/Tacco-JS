class DataStreamHandler {
    #lineSource;
    #currentLineTokens = [];
    #linePointer = 0;

    constructor(rawInputContent) {
        this.#lineSource = rawInputContent.trim().split('\n');
    }

    #prepareTokens() {
        if (this.#currentLineTokens.length === 0 && this.#linePointer < this.#lineSource.length) {
            this.#currentLineTokens = this.#lineSource[this.#linePointer++].split(' ');
        }
    }

    retrieveSingle(asString = false) {
        this.#prepareTokens();
        if (this.#currentLineTokens.length === 0) return undefined;
        const extracted = this.#currentLineTokens.shift();
        return asString ? extracted : Number(extracted);
    }

    retrieveLine(asString = false) {
        if (this.#linePointer >= this.#lineSource.length) return undefined;
        const lineContent = this.#lineSource[this.#linePointer++];
        const parts = lineContent.split(' ');
        return asString ? parts : parts.map(Number);
    }

    retrieveGrid(numRows, asString = false) {
        return Array.from({ length: numRows }, () => this.retrieveLine(asString));
    }

    retrieveRawLines(numRows, asString = false) {
        return Array.from({ length: numRows }, () => {
            if (this.#linePointer >= this.#lineSource.length) return undefined;
            const lineContent = this.#lineSource[this.#linePointer++];
            return asString ? lineContent : Number(lineContent);
        });
    }
}

const createInputParser = (inputContent) => new DataStreamHandler(inputContent);

const buildNestedArray = (initialValue, ...dimensions) => {
    const recursiveBuilder = (dims, currentDepth) => {
        if (currentDepth === dims.length - 1) {
            return Array(dims[currentDepth]).fill(initialValue);
        }
        return Array(dims[currentDepth]).fill(0).map(() => recursiveBuilder(dims, currentDepth + 1));
    };
    return recursiveBuilder(dimensions, 0);
};

const inputReader = createInputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

const computeFinalResult = () => {
    const totalItems = inputReader.retrieveSingle();
    const itemUnitSize = inputReader.retrieveSingle();
    let itemConfigurations = inputReader.retrieveGrid(totalItems);

    let accumulatedBaseValue = 0;
    itemConfigurations = itemConfigurations.map(config => {
        const primaryValue = config[0] * config[1];
        const secondaryValue = (itemUnitSize - config[0]) * config[2];
        accumulatedBaseValue += primaryValue;
        // Original pushes a, t, a+t. So config[3] is secondaryValue, config[4] is primaryValue, config[5] is combinedValue
        return [...config, secondaryValue, primaryValue, secondaryValue + primaryValue];
    });

    itemConfigurations.sort((cfgA, cfgB) => cfgB[5] - cfgA[5]);

    let highBoundary = totalItems * itemUnitSize;
    let lowBoundary = -1;

    while (highBoundary - lowBoundary > 1) {
        const currentMidpoint = Math.floor((highBoundary + lowBoundary) / 2);
        let currentAccumulatedValue = accumulatedBaseValue;
        let currentAvailableBudget = currentMidpoint;

        let currentItemIndex = 0;
        while (currentItemIndex < totalItems && currentAvailableBudget > 0 && currentAccumulatedValue > 0) {
            const currentItemConfig = itemConfigurations[currentItemIndex];

            if (itemUnitSize <= currentAvailableBudget) {
                currentAccumulatedValue -= currentItemConfig[5];
                currentAvailableBudget -= itemUnitSize;
            } else {
                let effectiveProcessingIndex = currentItemIndex;
                for (let j = currentItemIndex + 1; j < totalItems && currentAccumulatedValue > 0; j++) {
                    effectiveProcessingIndex = j;
                }
                
                const itemForPartialProcessing = itemConfigurations[effectiveProcessingIndex];

                if (currentAvailableBudget < itemForPartialProcessing[0]) {
                    currentAccumulatedValue -= itemForPartialProcessing[1] * currentAvailableBudget;
                } else {
                    currentAccumulatedValue -= itemForPartialProcessing[4] + (currentAvailableBudget - itemForPartialProcessing[0]) * itemForPartialProcessing[2];
                }
                currentAvailableBudget = 0;
                currentItemIndex = effectiveProcessingIndex;
            }
            currentItemIndex++;
        }

        if (currentAccumulatedValue > 0) {
            lowBoundary = currentMidpoint;
        } else {
            highBoundary = currentMidpoint;
        }
    }
    return highBoundary;
};

console.log(computeFinalResult());
