const inputAcquisition = require('readline');

let acquiredData = [];
let gridRows = [];
let totalMarkedElements = 0;

const inputProcessor = inputAcquisition.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputProcessor.on('line', (lineContent) => {
    acquiredData.push(lineContent);
});

inputProcessor.on('close', () => {
    let currentLineIndex = 0;

    // Parse dimensions
    const dimensionString = acquiredData[currentLineIndex++].split(" ");
    const verticalExtent = Number(dimensionString[0]);
    const horizontalExtent = Number(dimensionString[1]);

    // Parse grid data
    for (let i = 0; i < verticalExtent; i++) {
        gridRows.push(acquiredData[currentLineIndex++].split(""));
    }

    // Initialize Disjoint Set structure
    const connectivityManager = new DisjointSet();
    const markedCoordinates = []; // To store coordinates of '#' cells

    // Populate DSU and count marked elements
    for (let yCoord = 0; yCoord < verticalExtent; yCoord++) {
        for (let xCoord = 0; xCoord < horizontalExtent; xCoord++) {
            if (gridRows[yCoord][xCoord] === '#') {
                const currentIdentifier = `${yCoord},${xCoord}`;
                connectivityManager.establishSet(currentIdentifier);
                markedCoordinates.push(currentIdentifier);
                totalMarkedElements++;

                // Check 4-way neighbors and unite
                const neighborOffsets = [[0, 1], [0, -1], [1, 0], [-1, 0]]; // Right, Left, Down, Up
                for (const [dy, dx] of neighborOffsets) {
                    const nyCoord = yCoord + dy;
                    const nxCoord = xCoord + dx;

                    // Boundary check
                    if (nyCoord >= 0 && nyCoord < verticalExtent && nxCoord >= 0 && nxCoord < horizontalExtent) {
                        if (gridRows[nyCoord][nxCoord] === '#') {
                            const neighborIdentifier = `${nyCoord},${nxCoord}`;
                            connectivityManager.establishSet(neighborIdentifier); // Ensure neighbor is also in DSU
                            connectivityManager.uniteSets(currentIdentifier, neighborIdentifier);
                        }
                    }
                }
            }
        }
    }

    // Determine connectivity
    let resultOutcome = "No";
    if (totalMarkedElements === 0) {
        resultOutcome = "Yes"; // If no '#' elements, they are vacuously connected
    } else {
        const distinctRoots = new Set();
        for (const coordId of markedCoordinates) {
            distinctRoots.add(connectivityManager.findRoot(coordId));
        }

        if (distinctRoots.size === 1) {
            resultOutcome = "Yes";
        }
    }

    console.log(resultOutcome);
});

// Class for managing disjoint sets (Union-Find data structure)
class DisjointSet {
    constructor() {
        this.parentMap = new Map(); // Stores parent of each element
        this.rankMap = new Map();   // Stores rank for union by rank optimization
    }

    // Creates a new set with 'item' as its representative
    establishSet(item) {
        if (!this.parentMap.has(item)) {
            this.parentMap.set(item, item);
            this.rankMap.set(item, 0);
        }
    }

    // Finds the representative (root) of the set containing 'item'
    findRoot(item) {
        if (this.parentMap.get(item) === item) {
            return item;
        }
        // Path compression: set parent to the root of the tree
        const root = this.findRoot(this.parentMap.get(item));
        this.parentMap.set(item, root);
        return root;
    }

    // Unites the sets containing 'itemA' and 'itemB'
    uniteSets(itemA, itemB) {
        const rootA = this.findRoot(itemA);
        const rootB = this.findRoot(itemB);

        if (rootA !== rootB) {
            // Union by rank: attach smaller rank tree under root of higher rank tree
            const rankA = this.rankMap.get(rootA);
            const rankB = this.rankMap.get(rootB);

            if (rankA < rankB) {
                this.parentMap.set(rootA, rootB);
            } else if (rankB < rankA) {
                this.parentMap.set(rootB, rootA);
            } else {
                this.parentMap.set(rootB, rootA);
                this.rankMap.set(rootA, rankA + 1); // Increment rank if ranks were equal
            }
            return true; // Sets were united
        }
        return false; // Already in the same set
    }
}