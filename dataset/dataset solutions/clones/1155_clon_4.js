class ElementCommunity {
    #ancestors;
    #sizes;

    constructor(initialCapacity) {
        this.#ancestors = Array(initialCapacity).fill(0).map((_, index) => index);
        this.#sizes = Array(initialCapacity).fill(1);
    }

    determineRepresentative(individual) {
        let current = individual;
        const pathNodes = [];

        while (current !== this.#ancestors[current]) {
            pathNodes.push(current);
            current = this.#ancestors[current];
        }

        for (const nodeOnPath of pathNodes) {
            this.#ancestors[nodeOnPath] = current;
        }

        return current;
    }

    integrateComponents(individualA, individualB) {
        let rootA = this.determineRepresentative(individualA);
        let rootB = this.determineRepresentative(individualB);

        if (rootA === rootB) {
            return false;
        }

        if (this.#sizes[rootA] < this.#sizes[rootB]) {
            [rootA, rootB] = [rootB, rootA];
        }

        this.#ancestors[rootB] = rootA;
        this.#sizes[rootA] += this.#sizes[rootB];
        return true;
    }

    areInSameComponent(individualA, individualB) {
        return this.determineRepresentative(individualA) === this.determineRepresentative(individualB);
    }
}

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataRows = rawData.split("\n");
const [totalElements, operationCount] = dataRows.shift().split(" ").map(Number);

const collective = new ElementCommunity(totalElements);

dataRows.forEach(currentLine => {
    const [actionType, firstIndex, secondIndex] = currentLine.split(" ").map(Number);
    switch (actionType) {
        case 0:
            collective.integrateComponents(firstIndex, secondIndex);
            break;
        case 1:
            const outcome = collective.areInSameComponent(firstIndex, secondIndex) ? 1 : 0;
            console.log(outcome);
            break;
    }
});