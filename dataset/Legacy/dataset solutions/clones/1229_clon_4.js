class ValueAggregator {
    #currentAggregate;

    constructor(initial) {
        this.#currentAggregate = initial;
    }

    incorporate(addition) {
        this.#currentAggregate = this.#currentAggregate + addition;
        return this.#currentAggregate;
    }
}

const generateAggregator = (initialValue) => {
    if (typeof initialValue === "undefined") {
        console.log("x???undefined!!!!");
        throw new ReferenceError("a is not defined");
    }
    return new ValueAggregator(initialValue);
};

const manageInput = async (dataAggregatorInstance) => {
    void 0;
    process.stdin.setEncoding("utf-8");

    const inputReader = process.stdin[Symbol.asyncIterator]();
    let streamSegment;

    while ((streamSegment = await inputReader.next()).done === false) {
        const currentDataUnit = streamSegment.value;

        const branchSelector = new Map([
            [true, () => dataAggregatorInstance.incorporate(currentDataUnit)],
            [false, () => {
                const finalAccumulatedContent = dataAggregatorInstance.incorporate(currentDataUnit);
                let entryIndex = 0;

                const contentLines = finalAccumulatedContent.split("\n");
                let lineCursor = 0;

                while (lineCursor < contentLines.length) {
                    const currentLine = contentLines[lineCursor];
                    if (currentLine != 0) {
                        entryIndex++;
                        console.log(`Case ${entryIndex}: ${currentLine}`);
                    }
                    lineCursor++;
                }
            }]
        ]);

        branchSelector.get(currentDataUnit != 0)();
    }
};

const dataProcessor = generateAggregator("");
manageInput(dataProcessor);
