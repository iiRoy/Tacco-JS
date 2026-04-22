class InputProcessor {
    #tokenIndex = 0;
    #originalSource;
    #parsedTokens;

    constructor(sourceString) {
        this.#originalSource = sourceString;
        this.#parsedTokens = sourceString.match(/\S+/g) || [];
    }

    retrieveNextToken() {
        if (this.#tokenIndex < this.#parsedTokens.length) {
            const currentToken = this.#parsedTokens[this.#tokenIndex];
            this.#tokenIndex++;
            return currentToken;
        }
        return null;
    }

    retrieveNextInteger() {
        const token = this.retrieveNextToken();
        return token !== null ? parseInt(token, 10) : null;
    }

    retrieveNextDecimal() {
        const token = this.retrieveNextToken();
        return token !== null ? parseFloat(token) : null;
    }
    
    retrieveNextOctetArray() {
        const token = this.retrieveNextToken();
        return token !== null ? new Int8Array(token) : null;
    }
}

class GraphProcessor {
    #inputReader;
    #nodePayloads = new Map();
    #connections = new Map();
    #pathSequences = new Map();
    #processingQueue = [];
    #lastProcessedPath = [];

    constructor(inputReaderInstance) {
        this.#inputReader = inputReaderInstance;
    }

    #processVertex(currentVertex, parentVertex) {
        const parentPath = parentVertex !== -1 ? (this.#pathSequences.get(parentVertex) || []) : [];

        const currentVertexPath = [...parentPath, this.#nodePayloads.get(currentVertex)];
        this.#pathSequences.set(currentVertex, currentVertexPath);

        this.#lastProcessedPath = currentVertexPath;

        const neighborList = this.#connections.get(currentVertex);

        if (neighborList) {
            for (const neighbor of neighborList) {
                if (neighbor !== parentVertex) {
                    this.#processingQueue.push([neighbor, currentVertex]);
                }
            }
        }
    }

    commenceProcessing() {
        const nodeCount = this.#inputReader.retrieveNextInteger();

        for (let idx = 1; idx <= nodeCount; idx++) {
            this.#nodePayloads.set(idx, this.#inputReader.retrieveNextInteger());
        }

        for (let idx = 0; idx < nodeCount - 1; idx++) {
            const firstVertex = this.#inputReader.retrieveNextInteger();
            const secondVertex = this.#inputReader.retrieveNextInteger();

            if (!this.#connections.has(firstVertex)) {
                this.#connections.set(firstVertex, []);
            }
            if (!this.#connections.has(secondVertex)) {
                this.#connections.set(secondVertex, []);
            }

            this.#connections.get(firstVertex).push(secondVertex);
            this.#connections.get(secondVertex).push(firstVertex);
        }

        this.#processingQueue.push([1, -1]);

        while (this.#processingQueue.length > 0) {
            const [currentVertex, parentVertex] = this.#processingQueue.shift();
            this.#processVertex(currentVertex, parentVertex);
        }

        console.log(this.#lastProcessedPath);
        return;
    }
}

const systemInput = require("fs").readFileSync("/dev/stdin", "utf8");
const processorInstance = new GraphProcessor(new InputProcessor(systemInput));
processorInstance.commenceProcessing();