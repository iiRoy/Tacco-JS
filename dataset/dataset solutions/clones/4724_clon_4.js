class InputLineHandler {
    #sourceLines;
    #currentPosition;

    constructor(rawData) {
        this.#sourceLines = rawData;
        this.#currentPosition = 0;
    }

    hasMoreContent() {
        return this.#currentPosition < this.#sourceLines.length;
    }

    fetchNextLine() {
        if (!this.hasMoreContent()) {
            throw new Error("End of input reached.");
        }
        return this.#sourceLines[this.#currentPosition++];
    }

    extractInteger() {
        const raw = this.fetchNextLine();
        return parseInt(raw, 10);
    }

    extractIntegerSequence() {
        const raw = this.fetchNextLine();
        return raw.split(" ").map(Number);
    }
}

function retrieveRawData() {
    return require("fs").readFileSync(0, "utf8").trim().split("\n");
}

function displayResult(value) {
    console.log(value);
}

function displayError(message) {
    console.error(message);
}

function processSolution() {
    const rawInput = retrieveRawData();
    const inputProcessor = new InputLineHandler(rawInput);

    const initialParameters = inputProcessor.extractIntegerSequence();
    const totalItems = initialParameters[0];
    const desiredRatioA = initialParameters[1];
    const desiredRatioB = initialParameters[2];

    const productSpecifications = [];
    for (let i = 0; i < totalItems; i++) {
        productSpecifications.push(inputProcessor.extractIntegerSequence());
    }

    let currentAccumulatedStates = new Map();
    currentAccumulatedStates.set(0, new Map([[0, 0]]));

    const maxDimensionValue = 151;

    for (const currentProduct of productSpecifications) {
        const [productA, productB, productCost] = currentProduct;
        const nextAccumulatedStates = new Map();

        for (const [prevA, innerMap] of currentAccumulatedStates.entries()) {
            for (const [prevB, cost] of innerMap.entries()) {
                if (!nextAccumulatedStates.has(prevA)) {
                    nextAccumulatedStates.set(prevA, new Map());
                }
                const existingCost = nextAccumulatedStates.get(prevA).get(prevB);
                if (existingCost === undefined || cost < existingCost) {
                    nextAccumulatedStates.get(prevA).set(prevB, cost);
                }
            }
        }

        for (const [prevA, innerMap] of currentAccumulatedStates.entries()) {
            for (const [prevB, prevCost] of innerMap.entries()) {
                const newA = prevA + productA;
                const newB = prevB + productB;
                const newTotalCost = prevCost + productCost;

                if (newA < maxDimensionValue && newB < maxDimensionValue) {
                    if (!nextAccumulatedStates.has(newA)) {
                        nextAccumulatedStates.set(newA, new Map());
                    }
                    const existingCost = nextAccumulatedStates.get(newA).get(newB);
                    if (existingCost === undefined || newTotalCost < existingCost) {
                        nextAccumulatedStates.get(newA).set(newB, newTotalCost);
                    }
                }
            }
        }
        currentAccumulatedStates = nextAccumulatedStates;
    }

    let overallMinimumCost = Infinity;
    let ratioScaleFactor = 1;

    while (true) {
        const scaledTargetA = desiredRatioA * ratioScaleFactor;
        const scaledTargetB = desiredRatioB * ratioScaleFactor;

        if (scaledTargetA >= maxDimensionValue || scaledTargetB >= maxDimensionValue) {
            break;
        }

        const statesForA = currentAccumulatedStates.get(scaledTargetA);
        if (statesForA) {
            const costForB = statesForA.get(scaledTargetB);
            if (costForB !== undefined) {
                overallMinimumCost = Math.min(overallMinimumCost, costForB);
            }
        }
        ratioScaleFactor++;
    }

    if (overallMinimumCost === Infinity) {
        displayResult(-1);
    } else {
        displayResult(overallMinimumCost);
    }
}

processSolution();