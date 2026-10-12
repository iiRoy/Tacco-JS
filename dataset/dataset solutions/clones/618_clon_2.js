const lines = require("fs")
    .readFileSync(0, "utf8")
    .trim()
    .split(/\r?\n/);

const [height, width] = lines[0]
    .trim()
    .split(/\s+/)
    .map(Number);

const luminousMap = lines
    .slice(1, height + 1)
    .map(currentLine => currentLine.trim().split(""));

const explored = Array.from(
    { length: height },
    () => Array(width).fill(false)
);

const movements = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1]
];

let groupCount = 0;

for (let vertical = 0; vertical < height; vertical++) {
    for (let horizontal = 0; horizontal < width; horizontal++) {
        if (
            luminousMap[vertical][horizontal] !== "1" ||
            explored[vertical][horizontal]
        ) {
            continue;
        }

        groupCount++;

        const pendingTrees = [[vertical, horizontal]];
        explored[vertical][horizontal] = true;

        while (pendingTrees.length > 0) {
            const [activeRow, activeColumn] = pendingTrees.pop();

            for (const [verticalChange, horizontalChange] of movements) {
                const neighborRow = activeRow + verticalChange;
                const neighborColumn = activeColumn + horizontalChange;

                if (
                    neighborRow >= 0 &&
                    neighborRow < height &&
                    neighborColumn >= 0 &&
                    neighborColumn < width &&
                    luminousMap[neighborRow][neighborColumn] === "1" &&
                    !explored[neighborRow][neighborColumn]
                ) {
                    explored[neighborRow][neighborColumn] = true;
                    pendingTrees.push([neighborRow, neighborColumn]);
                }
            }
        }
    }
}

console.log(groupCount);