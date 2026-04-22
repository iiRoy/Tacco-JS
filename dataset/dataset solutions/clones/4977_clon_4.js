const processGridData = (sourceTxt) => {
    const lines = sourceTxt.trim().split('\n');
    const dimensions = lines[0].split(' ').map(Number);
    const gridHeight = dimensions[0];
    const gridWidth = dimensions[1];

    const outcomeTallies = new Array(10).fill(0);

    if (gridHeight < 3 || gridWidth < 3) {
        outcomeTallies[0] = (gridHeight - 2) * (gridWidth - 2);
        return outcomeTallies;
    }

    const markedCoordinates = new Set();
    if (lines.length > 1) {
        for (let k = 1; k < lines.length; k++) {
            const coords = lines[k].split(' ').map(Number);
            markedCoordinates.add(`${coords[0] - 1}_${coords[1] - 1}`);
        }
    }

    for (let r = 1; r <= gridHeight - 2; r++) {
        for (let c = 1; c <= gridWidth - 2; c++) {
            let currentNeighborCount = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (markedCoordinates.has(`${r + dr}_${c + dc}`)) {
                        currentNeighborCount++;
                    }
                }
            }
            outcomeTallies[currentNeighborCount]++;
        }
    }

    return outcomeTallies;
};

const invokeProcedure = (inputPayload) => {
    const finalCounts = processGridData(inputPayload);
    console.log(finalCounts.join('\n'));
};

invokeProcedure(require("fs").readFileSync("/dev/stdin", "utf8"));