class InputDataParser {
    #sourceLines;
    #currentLineIndex;

    constructor(sourceString) {
        this.#sourceLines = sourceString.trim().split("\n");
        this.#currentLineIndex = 0;
    }

    static #convertToNumber(value) {
        return +value;
    }

    #prepareCurrentLineForExtraction() {
        const lineContent = this.#sourceLines[this.#currentLineIndex];
        if (typeof lineContent === "string") {
            this.#sourceLines[this.#currentLineIndex] = lineContent.split(" ").reverse();
        }
        return this.#sourceLines[this.#currentLineIndex];
    }

    readNextItem(returnAsString = false) {
        const currentLineItems = this.#prepareCurrentLineForExtraction();
        const extractedItem = currentLineItems.pop();
        if (!currentLineItems.length) {
            this.#currentLineIndex++;
        }
        return returnAsString ? extractedItem : InputDataParser.#convertToNumber(extractedItem);
    }

    readLineItems(returnAsString = false) {
        const fullLine = this.#sourceLines[this.#currentLineIndex++];
        const itemsOnLine = fullLine.split(" ");
        return returnAsString ? itemsOnLine : itemsOnLine.map(InputDataParser.#convertToNumber);
    }

    readMatrix(numberOfRows, returnAsString = false) {
        const selectedRows = this.#sourceLines.slice(this.#currentLineIndex, this.#currentLineIndex + numberOfRows);
        this.#currentLineIndex += numberOfRows;
        const processedRows = selectedRows.map(line => line.split(" "));
        return returnAsString ? processedRows : processedRows.map(row => row.map(InputDataParser.#convertToNumber));
    }

    readRawLines(numberOfLines, returnAsString = false) {
        const selectedLines = this.#sourceLines.slice(this.#currentLineIndex, this.#currentLineIndex + numberOfLines);
        this.#currentLineIndex += numberOfLines;
        return returnAsString ? selectedLines : selectedLines.map(InputDataParser.#convertToNumber);
    }
}

const parserInstance = new InputDataParser(require("fs").readFileSync("/dev/stdin", "utf8"));

class DisjointSet {
    #parentOrSizeArray;

    constructor(elementCount) {
        this.#parentOrSizeArray = Array(elementCount + 1).fill(-1);
    }

    findRoot(element) {
        if (this.#parentOrSizeArray[element] < 0) {
            return element;
        }
        this.#parentOrSizeArray[element] = this.findRoot(this.#parentOrSizeArray[element]);
        return this.#parentOrSizeArray[element];
    }

    areConnected(elementX, elementY) {
        return this.findRoot(elementX) === this.findRoot(elementY);
    }

    unionSets(elementX, elementY) {
        let rootX = this.findRoot(elementX);
        let rootY = this.findRoot(elementY);

        if (rootX === rootY) {
            return;
        }

        if (this.#parentOrSizeArray[rootX] >= this.#parentOrSizeArray[rootY]) {
            this.#parentOrSizeArray[rootY] += this.#parentOrSizeArray[rootX];
            this.#parentOrSizeArray[rootX] = rootY;
        } else {
            this.#parentOrSizeArray[rootX] += this.#parentOrSizeArray[rootY];
            this.#parentOrSizeArray[rootY] = rootX;
        }
    }

    getSetSize(element) {
        return -this.#parentOrSizeArray[this.findRoot(element)];
    }
}

console.log(main());

function calculateTotalPossiblePairs(count) {
    return count * (count - 1) / 2;
}

function main() {
    const nodeCount = parserInstance.readNextItem();
    const edgeCount = parserInstance.readNextItem();
    const edges = parserInstance.readMatrix(edgeCount);

    const resultArray = Array(edgeCount);
    const disjointSetStructure = new DisjointSet(nodeCount);

    resultArray[edgeCount - 1] = calculateTotalPossiblePairs(nodeCount);

    for (let edgeIndex = edgeCount - 1; edgeIndex > 0; edgeIndex--) {
        const currentEdge = edges[edgeIndex];
        const [nodeU, nodeV] = currentEdge;

        const pairsBeforeCurrentEdge = resultArray[edgeIndex];

        if (disjointSetStructure.areConnected(nodeU, nodeV)) {
            resultArray[edgeIndex - 1] = pairsBeforeCurrentEdge;
        } else {
            const sizeOfSetU = disjointSetStructure.getSetSize(nodeU);
            const sizeOfSetV = disjointSetStructure.getSetSize(nodeV);
            const pairsRemovedByUnion = sizeOfSetU * sizeOfSetV;

            resultArray[edgeIndex - 1] = pairsBeforeCurrentEdge - pairsRemovedByUnion;
            disjointSetStructure.unionSets(nodeU, nodeV);
        }
    }

    return resultArray.join("\n");
}
