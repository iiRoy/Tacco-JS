class GraphReader {
    constructor(textData, separatorPattern) {
        const pattern = new RegExp(separatorPattern.split("").join("|"), "g");
        this.currentOffset = 0;
        this.tokenCollection = textData.replace(/\r/g, '').split(pattern).filter(token => token !== '');
    }

    hasMoreTokens() {
        return this.currentOffset < this.tokenCollection.length;
    }

    retrieveNextToken() {
        if (this.currentOffset >= this.tokenCollection.length) {
            throw new RangeError("End of input reached.");
        }
        return this.tokenCollection[this.currentOffset++];
    }

    readInteger() {
        const token = this.retrieveNextToken();
        const num = parseInt(token, 10);
        if (isNaN(num)) {
            throw new TypeError(`'${token}' cannot be converted to an integer.`);
        }
        return num;
    }

    peekCurrentToken() {
        if (this.currentOffset >= this.tokenCollection.length) {
            return undefined;
        }
        return this.tokenCollection[this.currentOffset];
    }

    resetReader() {
        this.currentOffset = 0;
    }
}

function executeCalculation(sourceData) {
    const outputWriter = console.log;
    const dataInterpreter = new GraphReader(sourceData, " \n");

    const vertexCount = dataInterpreter.readInteger();
    const edgeCount = dataInterpreter.readInteger();

    const adjacencyStructure = new Array(vertexCount).fill(null).map(() => []);
    const inboundDegrees = new Array(vertexCount).fill(0);
    const maximumAttainableScores = new Array(vertexCount).fill(-Infinity);

    for (let k = 0; k < edgeCount; ++k) {
        const originVertex = dataInterpreter.readInteger();
        const destinationVertex = dataInterpreter.readInteger();
        const connectionWeight = dataInterpreter.readInteger();

        adjacencyStructure[originVertex].push({ target: destinationVertex, weight: connectionWeight });
        inboundDegrees[destinationVertex]++;
    }

    const processQueue = [];
    for (let k = 0; k < vertexCount; ++k) {
        if (inboundDegrees[k] === 0) {
            processQueue.push(k);
        }
    }

    if (vertexCount > 0) {
        maximumAttainableScores[0] = 0;
    } else {
        outputWriter(0);
        return;
    }

    while (processQueue.length > 0) {
        const currentVertex = processQueue.shift();

        if (maximumAttainableScores[currentVertex] !== -Infinity) {
            for (const connection of adjacencyStructure[currentVertex]) {
                const nextVertex = connection.target;
                const edgeCost = connection.weight;

                maximumAttainableScores[nextVertex] = Math.max(
                    maximumAttainableScores[nextVertex],
                    maximumAttainableScores[currentVertex] + edgeCost
                );

                inboundDegrees[nextVertex]--;
                if (inboundDegrees[nextVertex] === 0) {
                    processQueue.push(nextVertex);
                }
            }
        }
    }

    let finalMax = 0;
    if (vertexCount > 0) {
        finalMax = Math.max(...maximumAttainableScores);
    }
    
    outputWriter(finalMax);
}

executeCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));