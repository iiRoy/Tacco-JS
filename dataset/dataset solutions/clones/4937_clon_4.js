class DisjointUnion {
    constructor(totalElements) {
        this.parentArray = Array.from({ length: totalElements }, (_, i) => i);
        this.rankArray = Array(totalElements).fill(0);
        this.componentCount = totalElements;
    }

    identifyRepresentative(idx) {
        if (this.parentArray[idx] === idx) {
            return idx;
        }
        this.parentArray[idx] = this.identifyRepresentative(this.parentArray[idx]);
        return this.parentArray[idx];
    }

    mergeSets(idxA, idxB) {
        let rootA = this.identifyRepresentative(idxA);
        let rootB = this.identifyRepresentative(idxB);

        if (rootA !== rootB) {
            if (this.rankArray[rootA] < this.rankArray[rootB]) {
                this.parentArray[rootA] = rootB;
            } else if (this.rankArray[rootA] > this.rankArray[rootB]) {
                this.parentArray[rootB] = rootA;
            } else {
                this.parentArray[rootB] = rootA;
                this.rankArray[rootA]++;
            }
            this.componentCount--;
            return true;
        }
        return false;
    }

    allConnected() {
        return this.componentCount === 1;
    }
}

function computeNetworkCost(inputData) {
    const lines = inputData.split('\n');

    const [widthStr, heightStr] = lines[0].split(' ');
    const gridWidth = parseInt(widthStr);
    const gridHeight = parseInt(heightStr);

    const horizontalCostStrings = lines.slice(1, 1 + gridWidth);
    const horizontalCosts = horizontalCostStrings.map(s => parseInt(s) || 100000001);

    const verticalCostStrings = lines.slice(1 + gridWidth, 1 + gridWidth + gridHeight);
    const verticalCosts = verticalCostStrings.map(s => parseInt(s) || 100000001);

    const totalGridPoints = (gridWidth + 1) * (gridHeight + 1);
    const allEdges = [];

    for (let currentY = 0; currentY <= gridHeight; currentY++) {
        for (let currentX = 0; currentX < gridWidth; currentX++) {
            const point1 = currentY * (gridWidth + 1) + currentX;
            const point2 = currentY * (gridWidth + 1) + (currentX + 1);
            allEdges.push({
                origin: point1,
                destination: point2,
                value: horizontalCosts[currentX]
            });
        }
    }

    for (let currentY = 0; currentY < gridHeight; currentY++) {
        for (let currentX = 0; currentX <= gridWidth; currentX++) {
            const point1 = currentY * (gridWidth + 1) + currentX;
            const point2 = (currentY + 1) * (gridWidth + 1) + currentX;
            allEdges.push({
                origin: point1,
                destination: point2,
                value: verticalCosts[currentY]
            });
        }
    }

    allEdges.sort((a, b) => a.value - b.value);

    let minimumSpanningTotal = 0;
    const unionFindStructure = new DisjointUnion(totalGridPoints);

    for (const link of allEdges) {
        if (unionFindStructure.identifyRepresentative(link.origin) !== unionFindStructure.identifyRepresentative(link.destination)) {
            unionFindStructure.mergeSets(link.origin, link.destination);
            minimumSpanningTotal += link.value;

            if (unionFindStructure.allConnected()) {
                break;
            }
        }
    }

    console.log(minimumSpanningTotal);
}

computeNetworkCost(require("fs").readFileSync("/dev/stdin", "utf8"));