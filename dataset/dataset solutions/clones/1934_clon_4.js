class Lexer {
    #tokenPosition;
    #initialContent;
    #tokenArray;

    constructor(sourceData) {
        this.#tokenPosition = 0;
        this.#initialContent = sourceData;
        this.#tokenArray = this.#tokenizeSource(sourceData);
    }

    #tokenizeSource(sourceString) {
        const normalizedString = sourceString.replace(/[\n\t]+/g, ' ');
        return normalizedString.split(' ');
    }

    retrieveToken() {
        if (this.#tokenPosition >= this.#tokenArray.length) {
            return null;
        }
        const currentSegment = this.#tokenArray[this.#tokenPosition];
        this.#tokenPosition++;
        return currentSegment;
    }

    retrieveInteger() {
        const segment = this.retrieveToken();
        return segment !== null ? parseInt(segment, 10) : null;
    }

    retrieveFloat() {
        const segment = this.retrieveToken();
        return segment !== null ? parseFloat(segment) : null;
    }

    retrieveByteArr() {
        const segment = this.retrieveToken();
        if (segment === null) {
            return null;
        }
        // This will throw TypeError if 'segment' is a string, matching original behavior
        return new Int8Array(segment);
    }
}

class GraphAnalyzer {
    #nodePayloads;
    #nodeConnections;
    #pathRecords;
    #processingStack;

    constructor(dataFeeder) {
        const nodeTotal = dataFeeder.retrieveInteger();
        this.#nodePayloads = new Map();
        for (let idx = 0; idx < nodeTotal; ++idx) {
            this.#nodePayloads.set(idx + 1, dataFeeder.retrieveInteger());
        }

        this.#nodeConnections = new Map();
        for (let idx = 0; idx < nodeTotal - 1; ++idx) {
            const pointOne = dataFeeder.retrieveInteger();
            const pointTwo = dataFeeder.retrieveInteger();

            if (!this.#nodeConnections.has(pointOne)) {
                this.#nodeConnections.set(pointOne, []);
            }
            this.#nodeConnections.get(pointOne).push(pointTwo);

            if (!this.#nodeConnections.has(pointTwo)) {
                this.#nodeConnections.set(pointTwo, []);
            }
            this.#nodeConnections.get(pointTwo).push(pointOne);
        }

        this.#pathRecords = new Map();
        this.#processingStack = [];

        this.#processingStack.push({ currentElement: 1, originElement: -1 });

        let guardCounter = 10000000;
        while (this.#processingStack.length > 0 && guardCounter-- > 0) {
            const { currentElement, originElement } = this.#processingStack.shift();
            this.#processNode(currentElement, originElement);
        }
        // The original Main function contains a 'return;' statement here,
        // making all subsequent code unreachable.
        // Therefore, this constructor ends here, replicating the exact functionality.
    }

    #processNode = (currentElement, originElement) => {
        let currentPathString = this.#pathRecords.has(originElement)
            ? this.#pathRecords.get(originElement)
            : "";

        currentPathString += (this.#nodePayloads.get(currentElement) + ",");
        this.#pathRecords.set(currentElement, currentPathString);

        const connectedElements = this.#nodeConnections.get(currentElement);

        if (connectedElements) {
            for (const nextElement of connectedElements) {
                if (!this.#pathRecords.has(nextElement)) {
                    this.#processingStack.push({ currentElement: nextElement, originElement: currentElement });
                }
            }
        }
    }
}

new GraphAnalyzer(new Lexer(require("fs").readFileSync("/dev/stdin", "utf8")));