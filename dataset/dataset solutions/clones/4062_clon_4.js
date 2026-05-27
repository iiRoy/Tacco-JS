class DisjointSetUnion {
    constructor(size) {
        this.parent = Array(size + 1).fill(0).map((_, idx) => idx);
        this.relativeOffset = Array(size + 1).fill(0);
    }

    locate(idx) {
        if (this.parent[idx] === idx) {
            return { root: idx, offset: 0 };
        }

        const result = this.locate(this.parent[idx]);
        this.parent[idx] = result.root;
        this.relativeOffset[idx] += result.offset;
        return { root: this.parent[idx], offset: this.relativeOffset[idx] };
    }

    unite(nodeA, nodeB, difference) {
        const infoA = this.locate(nodeA);
        const infoB = this.locate(nodeB);

        if (infoA.root !== infoB.root) {
            this.parent[infoA.root] = infoB.root;
            this.relativeOffset[infoA.root] = infoB.offset - infoA.offset - difference;
            return true;
        } else {
            return (infoB.offset - infoA.offset === difference);
        }
    }
}

function ProcessConstraints(inputData) {
    const { nodeCount, constraints } = inputData;
    const dsu = new DisjointSetUnion(nodeCount);
    let outcome = "Yes";

    for (const [u, v, d] of constraints) {
        if (!dsu.unite(u, v, d)) {
            outcome = "No";
            break;
        }
    }
    console.log(outcome);
}

function parseInputData(rawInput) {
    const lines = rawInput.split("\n");
    const firstLine = lines[0].split(" ").map(Number);
    const nodeCount = firstLine[0];
    const constraintCount = firstLine[1];

    const constraints = [];
    for (let k = 0; k < constraintCount; k++) {
        constraints.push(lines[k + 1].split(" ").map(Number));
    }
    return { nodeCount, constraints };
}

function Main(input) {
    const parsedData = parseInputData(input);
    ProcessConstraints(parsedData);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
