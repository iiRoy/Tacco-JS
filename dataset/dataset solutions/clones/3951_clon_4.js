const renderGrid = (sourceData) => {
    const dataParts = sourceData.split(/\n|\s/).filter(segment => segment.length > 0);
    let countPrimary = parseInt(dataParts[0], 10);
    let countSecondary = parseInt(dataParts[1], 10);

    const primaryModifications = new Set();
    let iterX1 = 1;
    let iterY1 = 1;
    for (let k = 0; k < countPrimary - 1; k++) {
        primaryModifications.add(`${iterY1},${iterX1}`);
        iterX1 += 2;
        if (iterX1 >= 100) {
            iterX1 = 1;
            iterY1 += 3;
        }
    }

    const secondaryModifications = new Set();
    let iterX2 = 1;
    let iterY2 = 51;
    for (let k = 0; k < countSecondary - 1; k++) {
        secondaryModifications.add(`${iterY2},${iterX2}`);
        iterX2 += 2;
        if (iterX2 >= 100) {
            iterX2 = 1;
            iterY2 += 3;
        }
    }

    const constructedCanvas = Array.from({ length: 100 }, (_, rowIndex) => {
        return Array.from({ length: 100 }, (_, colIndex) => {
            const cellKey = `${rowIndex},${colIndex}`;
            if (rowIndex < 50) {
                return primaryModifications.has(cellKey) ? '.' : '#';
            } else {
                return secondaryModifications.has(cellKey) ? '#' : '.';
            }
        }).join('');
    });

    console.log('100 100');
    constructedCanvas.forEach(rowString => console.log(rowString));
};

if (typeof window === "undefined") {
    renderGrid(require("fs").readFileSync("/dev/stdin", "utf8"));
}