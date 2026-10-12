function Main(inputContent) {
    const dataLines = inputContent.split("\n");

    const [gridHeight, gridWidth] = dataLines[0].split(" ").map(Number);

    const terrainMap = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(null));
    let currentWaveFront = new Set(); // Stores stringified coordinates "y,x"

    for (let r = 0; r < gridHeight; r++) {
        const rowElements = dataLines[r + 1].split("");
        for (let c = 0; c < gridWidth; c++) {
            terrainMap[r][c] = rowElements[c];
            if (rowElements[c] === "#") {
                currentWaveFront.add(`${r},${c}`);
            }
        }
    }

    let expansionCycles = 0;
    const cardinalDirections = [[0, 1], [0, -1], [1, 0], [-1, 0]]; // [deltaY, deltaX]

    while (currentWaveFront.size > 0) {
        expansionCycles++;
        const nextWaveFront = new Set();

        for (const currentCoordKey of currentWaveFront) {
            const [yPos, xPos] = currentCoordKey.split(",").map(Number);

            for (const [dy, dx] of cardinalDirections) {
                const nextY = yPos + dy;
                const nextX = xPos + dx;

                if (nextY >= 0 && nextY < gridHeight && nextX >= 0 && nextX < gridWidth) {
                    if (terrainMap[nextY][nextX] === ".") {
                        terrainMap[nextY][nextX] = "#"; // Mark as filled
                        nextWaveFront.add(`${nextY},${nextX}`);
                    }
                }
            }
        }
        currentWaveFront = nextWaveFront;
    }
    console.log(expansionCycles - 1);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
