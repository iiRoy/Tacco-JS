class InputParser {
    #tokenSequence;
    #currentPosition = 0;

    constructor(sourceContent) {
        const normalizedContent = sourceContent.replace(/[\n\t]+/g, " ");
        this.#tokenSequence = normalizedContent.split(" ");
    }

    #retrieveNextElement() {
        if (this.#currentPosition < this.#tokenSequence.length) {
            return this.#tokenSequence[this.#currentPosition++];
        }
        return null;
    }

    obtainString() {
        return this.#retrieveNextElement();
    }

    obtainInteger() {
        const element = this.#retrieveNextElement();
        return element !== null ? parseInt(element, 10) : null;
    }

    obtainFloat() {
        const element = this.#retrieveNextElement();
        return element !== null ? parseFloat(element) : null;
    }

    obtainByteRepresentation() {
        const element = this.#retrieveNextElement();
        return element !== null ? new Int8Array(element.length) : null;
    }
}

class SequenceProcessor {
    #transitionGraph;
    #startNode = 1;
    #nodeCount;

    constructor(config) {
        this.#nodeCount = config.nodeCount;
        this.#transitionGraph = new Map();
        for (let i = 0; i < this.#nodeCount; i++) {
            this.#transitionGraph.set(i + 1, config.dataParser.obtainInteger());
        }
    }

    processSteps(totalOperations) {
        let currentNode = this.#startNode;
        const pathHistory = new Map();

        let currentIteration = 0;
        let cycleEntryIteration = -1;
        let cyclePeriod = 0;

        for (let i = 0; i < this.#nodeCount; i++) {
            currentNode = this.#transitionGraph.get(currentNode);
            if (pathHistory.has(currentNode)) {
                cycleEntryIteration = pathHistory.get(currentNode);
                cyclePeriod = i - cycleEntryIteration;
                currentIteration = i;
                break;
            }
            pathHistory.set(currentNode, i);
            currentIteration = i;
        }

        let adjustedOperations = totalOperations;

        if (currentIteration < this.#nodeCount - 1) {
            const preCycleLength = cycleEntryIteration - 1;
            adjustedOperations = ((totalOperations - preCycleLength) % cyclePeriod) + preCycleLength;
        }

        let finalNode = this.#startNode;
        finalNode = Array.from({ length: adjustedOperations }).reduce((accumulator, _, __) => {
            return this.#transitionGraph.get(accumulator);
        }, this.#startNode);

        console.log(finalNode);
    }
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const dataParserInstance = new InputParser(fileContent);

const N_value = dataParserInstance.obtainInteger();
const K_value = dataParserInstance.obtainInteger();

const sequenceHandler = new SequenceProcessor({ nodeCount: N_value, dataParser: dataParserInstance });
sequenceHandler.processSteps(K_value);
