const inputSourceUtility = (() => {
    class DataStreamHandler {
        #lineGenerator;
        #tokenGenerator = null;

        constructor(rawInput) {
            const processedLines = rawInput.trim().split('\n');
            this.#lineGenerator = (function* () {
                for (const lineContent of processedLines) {
                    yield lineContent;
                }
            })();
        }

        #createTokenGenerator(lineText) {
            return (function* () {
                const tokens = lineText.split(' ');
                for (const tokenValue of tokens) {
                    yield tokenValue;
                }
            })();
        }

        extractAtom(isStringOutput) {
            if (!this.#tokenGenerator) {
                const lineResult = this.#lineGenerator.next();
                if (lineResult.done) {
                    return undefined;
                }
                this.#tokenGenerator = this.#createTokenGenerator(lineResult.value);
            }

            let tokenResult = this.#tokenGenerator.next();
            if (tokenResult.done) {
                this.#tokenGenerator = null;
                const lineResult = this.#lineGenerator.next();
                if (lineResult.done) {
                    return undefined;
                }
                this.#tokenGenerator = this.#createTokenGenerator(lineResult.value);
                tokenResult = this.#tokenGenerator.next();
            }
            
            return isStringOutput ? tokenResult.value : Number(tokenResult.value);
        }

        retrieveLine(isStringOutput) {
            this.#tokenGenerator = null;
            const lineResult = this.#lineGenerator.next();
            if (lineResult.done) return undefined;
            const parts = lineResult.value.split(' ');
            return isStringOutput ? parts : parts.map(Number);
        }

        obtainMatrix(rowsToRead, isStringOutput) {
            this.#tokenGenerator = null;
            const collectedRows = [];
            for (let k = 0; k < rowsToRead; k++) {
                const lineResult = this.#lineGenerator.next();
                if (lineResult.done) break;
                const parts = lineResult.value.split(' ');
                collectedRows.push(isStringOutput ? parts : parts.map(Number));
            }
            return collectedRows;
        }

        fetchRawLines(rowsToRead, isStringOutput) {
            this.#tokenGenerator = null;
            const collectedLines = [];
            for (let k = 0; k < rowsToRead; k++) {
                const lineResult = this.#lineGenerator.next();
                if (lineResult.done) break;
                collectedLines.push(isStringOutput ? lineResult.value : Number(lineResult.value));
            }
            return collectedLines;
        }
    }

    return (sourceInput) => {
        const handlerInstance = new DataStreamHandler(sourceInput);
        return {
            a: (flag) => handlerInstance.extractAtom(flag),
            l: (flag) => handlerInstance.retrieveLine(flag),
            m: (count, flag) => handlerInstance.obtainMatrix(count, flag),
            r: (count, flag) => handlerInstance.fetchRawLines(count, flag),
        };
    };
})();

var o = inputSourceUtility(require("fs").readFileSync("/dev/stdin","utf8"));

function main() {
    const totalNodes = o.a();
    const totalEdges = o.a();
    const edgeData = o.m(totalEdges);

    const reverseGraphMap = new Map();
    const initialSourceNodes = new Set();

    for (const [sourceNode, targetNode] of edgeData) {
        if (!reverseGraphMap.has(targetNode)) {
            reverseGraphMap.set(targetNode, new Set());
        }
        reverseGraphMap.get(targetNode).add(sourceNode);
        initialSourceNodes.add(sourceNode);
    }

    let currentProcessingLayer = new Set();
    for (let nodeIdentifier = 1; nodeIdentifier <= totalNodes; nodeIdentifier++) {
        if (!initialSourceNodes.has(nodeIdentifier)) {
            currentProcessingLayer.add(nodeIdentifier);
        }
    }

    let layerDepth = -1;

    while (currentProcessingLayer.size > 0) {
        layerDepth++;
        const nextProcessingLayer = new Set();

        for (const currentLayerNode of currentProcessingLayer) {
            const predecessorsOfNode = reverseGraphMap.get(currentLayerNode);
            if (predecessorsOfNode) {
                for (const predecessorNode of predecessorsOfNode) {
                    nextProcessingLayer.add(predecessorNode);
                }
            }
        }
        currentProcessingLayer = nextProcessingLayer;
    }

    return layerDepth;
}

console.log(main());
