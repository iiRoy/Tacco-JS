class ContentAggregator {
    #storedData;

    constructor(startingValue) {
        this.#storedData = startingValue;
    }

    addPortion(incomingPiece) {
        this.#storedData += incomingPiece;
        return this.#storedData;
    }

    retrieveAccumulated() {
        return this.#storedData;
    }
}

class InputController {
    #aggregatorInstance;
    #dataStream;

    constructor(aggregatorRef, streamSource) {
        this.#aggregatorInstance = aggregatorRef;
        this.#dataStream = streamSource;
    }

    activateMonitor() {
        // Assuming the intent was to call resume() for the stream to flow
        this.#dataStream.resume();
        this.#dataStream.setEncoding("utf-8");

        this.#dataStream.on("data", (receivedFragment) => {
            this.#processFragment(receivedFragment);
        });
    }

    #processFragment(receivedFragment) {
        const TRIGGER_VALUE = "0";

        if (receivedFragment !== TRIGGER_VALUE) {
            this.#aggregatorInstance.addPortion(receivedFragment);
        } else {
            // As per original, add the trigger value itself to the stored data
            this.#aggregatorInstance.addPortion(receivedFragment);

            const finalCollection = this.#aggregatorInstance.retrieveAccumulated();
            this.#outputProcessedLines(finalCollection);
        }
    }

    #outputProcessedLines(completeString) {
        let sequenceCounter = 0;

        // Original filter: `e != 0`. For strings, this filters out "0".
        // Example: "" != 0 -> true, "abc" != 0 -> true, "0" != 0 -> false.
        const filteredLines = completeString.split("\n").filter(lineItem => lineItem !== "0");

        filteredLines.forEach(lineItem => {
            sequenceCounter++;
            console.log(`Case ${sequenceCounter}: ${lineItem}`);
        });
    }
}

// Global setup
const primaryAggregator = new ContentAggregator("");
const primaryController = new InputController(primaryAggregator, process.stdin);

primaryController.activateMonitor();