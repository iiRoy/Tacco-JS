function parseIntegerBase10(strVal) {
    return parseInt(strVal, 10);
}

function processInputData(inputContent) {
    let inputLines = inputContent.split("\n");

    const firstLineParts = inputLines.shift().split(" ");
    const gridSizeN = parseIntegerBase10(firstLineParts[0]);
    const numColorsC = parseIntegerBase10(firstLineParts[1]);

    const costMatrixD = Array.from({ length: numColorsC }, (_, idx) =>
        inputLines.splice(0, 1)[0].split(" ").map(parseIntegerBase10)
    );

    const colorGrid = Array.from({ length: gridSizeN }, (_, idx) =>
        inputLines.splice(0, 1)[0].split(" ").map(parseIntegerBase10)
    );

    const colorCountsByMod3 = [
        Array(numColorsC).fill(0),
        Array(numColorsC).fill(0),
        Array(numColorsC).fill(0)
    ];

    for (let rowIdx = 0; rowIdx < gridSizeN; rowIdx++) {
        const currentRow = colorGrid[rowIdx];
        for (let colIdx = 0; colIdx < gridSizeN; colIdx++) {
            const currentColor = currentRow[colIdx];
            const modGroup = (rowIdx + colIdx) % 3;
            colorCountsByMod3[modGroup][currentColor - 1]++;
        }
    }

    const minCostPerMod3Group = colorCountsByMod3.map((currentStatArray, modGroupIndex) => {
        const debugOutputArray = Array.from({ length: numColorsC }, (_, toColorIdx) =>
            currentStatArray.map((countVal, fromColorIdx) =>
                fromColorIdx === toColorIdx ? 0 : countVal * costMatrixD[fromColorIdx][toColorIdx]
            )
        );
        console.log(debugOutputArray);

        const costsForTargetColors = Array.from({ length: numColorsC }, (_, targetColorIdx) => {
            let totalCostForTarget = 0;
            for (let sourceColorIdx = 0; sourceColorIdx < numColorsC; sourceColorIdx++) {
                if (sourceColorIdx !== targetColorIdx) {
                    totalCostForTarget += currentStatArray[sourceColorIdx] * costMatrixD[sourceColorIdx][targetColorIdx];
                }
            }
            return totalCostForTarget;
        });
        return costsForTargetColors;
    });

    let overallMinCost = Infinity;

    for (let colorA = 0; colorA < numColorsC; colorA++) {
        const costForGroup0 = minCostPerMod3Group[0][colorA];
        for (let colorB = 0; colorB < numColorsC; colorB++) {
            if (colorA === colorB) {
                continue;
            }
            const costForGroup1 = minCostPerMod3Group[1][colorB];
            for (let colorC = 0; colorC < numColorsC; colorC++) {
                if (colorB === colorC || colorA === colorC) {
                    continue;
                }
                const costForGroup2 = minCostPerMod3Group[2][colorC];

                const currentTotalCost = costForGroup0 + costForGroup1 + costForGroup2;

                if (overallMinCost <= currentTotalCost) {
                    console.log(colorA, colorB, colorC);
                }
                overallMinCost = Math.min(overallMinCost, currentTotalCost);
            }
        }
    }

    console.log(inputContent, colorCountsByMod3, minCostPerMod3Group, overallMinCost);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
