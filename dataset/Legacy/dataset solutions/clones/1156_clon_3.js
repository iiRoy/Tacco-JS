function handleInputData(rawInputString) {
    const inputLines = rawInputString.split("\n");

    const initialParams = inputLines[0].split(" ");
    const elementCount = parseInt(initialParams[0], 10);
    const operationCount = parseInt(initialParams[1], 10);

    const disjointSetElements = Array.from({ length: elementCount }, () => new DisjointSetNode());

    const mainDisjointSetStructure = new DisjointSetNode();

    for (let opIdx = 0; opIdx < operationCount; opIdx++) {
        const currentOperationLine = inputLines[opIdx + 1];
        const currentOperationTokens = currentOperationLine.split(" ");

        const commandType = currentOperationTokens[0];
        const firstElementIdx = parseInt(currentOperationTokens[1], 10);
        const secondElementIdx = parseInt(currentOperationTokens[2], 10);

        const nodeA = disjointSetElements[firstElementIdx];
        const nodeB = disjointSetElements[secondElementIdx];

        if (commandType === "0") {
            mainDisjointSetStructure.performUnion(nodeA, nodeB);
        } else {
            console.log(mainDisjointSetStructure.checkConnection(nodeA, nodeB));
        }
    }
}

function DisjointSetNode() {
    this._parentReference = this;
    this._componentSize = 1;

    this.findRepresentative = function() {
        if (this._parentReference === this) {
            return this;
        } else {
            this._parentReference = this._parentReference.findRepresentative();
            return this._parentReference;
        }
    };

    this.performUnion = function(elementX, elementY) {
        const rootX = elementX.findRepresentative();
        const rootY = elementY.findRepresentative();

        if (rootX === rootY) {
            return false;
        } else {
            if (rootX._componentSize < rootY._componentSize) {
                rootX._parentReference = rootY;
                rootY._componentSize += rootX._componentSize;
            } else {
                rootY._parentReference = rootX;
                rootX._componentSize += rootY._componentSize;
            }
            return true;
        }
    };

    this.checkConnection = function(elementOne, elementTwo) {
        return elementOne.findRepresentative() === elementTwo.findRepresentative() ? 1 : 0;
    };
}

handleInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
