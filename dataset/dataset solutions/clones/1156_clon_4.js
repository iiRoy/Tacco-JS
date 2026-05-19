function Main(inputData) {
    const lines = inputData.split("\n");
    const [elementCount, queryCount] = lines[0].split(" ").map(Number);

    const setManager = new DisjointSet(elementCount);

    for (let k = 1; k <= queryCount; ++k) {
        const queryDetails = lines[k].split(" ").map(Number);
        const operationType = queryDetails[0];
        const firstElement = queryDetails[1];
        const secondElement = queryDetails[2];

        if (operationType === 0) {
            setManager.mergeSets(firstElement, secondElement);
        } else {
            console.log(setManager.areConnected(firstElement, secondElement));
        }
    }
}

function DisjointSet(totalElements) {
    this.parentMap = Array.from({ length: totalElements }, (_, index) => index);
    this.setSizes = Array(totalElements).fill(1);

    this.findRepresentative = function(itemIndex) {
        let current = itemIndex;
        while (this.parentMap[current] !== current) {
            this.parentMap[current] = this.parentMap[this.parentMap[current]];
            current = this.parentMap[current];
        }
        return current;
    };

    this.mergeSets = function(itemA, itemB) {
        const rootA = this.findRepresentative(itemA);
        const rootB = this.findRepresentative(itemB);

        if (rootA === rootB) {
            return false;
        }

        if (this.setSizes[rootA] < this.setSizes[rootB]) {
            this.parentMap[rootA] = rootB;
            this.setSizes[rootB] += this.setSizes[rootA];
        } else {
            this.parentMap[rootB] = rootA;
            this.setSizes[rootA] += this.setSizes[rootB];
        }
        return true;
    };

    this.areConnected = function(itemA, itemB) {
        return this.findRepresentative(itemA) === this.findRepresentative(itemB) ? 1 : 0;
    };
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
