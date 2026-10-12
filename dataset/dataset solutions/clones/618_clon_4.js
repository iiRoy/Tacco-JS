const tokens = require("fs")
    .readFileSync(0, "utf8")
    .trim()
    .split(/\s+/);

const height = Number(tokens.shift());
const width = Number(tokens.shift());
const grid = tokens.slice(0, height);

const parent = Array(height * width).fill(-1);
const rank = Array(height * width).fill(0);

function find(tree) {
    if (parent[tree] !== tree) {
        parent[tree] = find(parent[tree]);
    }

    return parent[tree];
}

function unite(firstTree, secondTree) {
    let firstRoot = find(firstTree);
    let secondRoot = find(secondTree);

    if (firstRoot === secondRoot) {
        return false;
    }

    if (rank[firstRoot] < rank[secondRoot]) {
        [firstRoot, secondRoot] = [secondRoot, firstRoot];
    }

    parent[secondRoot] = firstRoot;

    if (rank[firstRoot] === rank[secondRoot]) {
        rank[firstRoot]++;
    }

    return true;
}

function getTreeId(row, column) {
    return row * width + column;
}

let independentColonies = 0;

for (let row = 0; row < height; row++) {
    for (let column = 0; column < width; column++) {
        if (grid[row][column] === "0") {
            continue;
        }

        const currentTree = getTreeId(row, column);
        parent[currentTree] = currentTree;
        independentColonies++;

        if (row > 0 && grid[row - 1][column] === "1") {
            const upperTree = getTreeId(row - 1, column);

            if (unite(currentTree, upperTree)) {
                independentColonies--;
            }
        }

        if (column > 0 && grid[row][column - 1] === "1") {
            const leftTree = getTreeId(row, column - 1);

            if (unite(currentTree, leftTree)) {
                independentColonies--;
            }
        }
    }
}

console.log(independentColonies);