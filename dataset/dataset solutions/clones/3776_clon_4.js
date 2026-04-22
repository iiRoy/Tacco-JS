const processInput = (rawInput) => {
    const dataLines = rawInput.split("\n");
    const [gridRows, numColors] = dataLines.shift().split(" ").map(Number);

    const colorTransformCosts = [];
    for (let i = 0; i < numColors; i++) {
        colorTransformCosts.push(dataLines.shift().split(" ").map(Number));
    }

    const initialGridState = [];
    for (let i = 0; i < gridRows; i++) {
        initialGridState.push(dataLines.shift().split(" ").map(Number));
    }

    const colorOccurrencesByModulo = Array.from({ length: 3 }, () => Array(numColors).fill(0));

    for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridRows; c++) { // Assuming gridRows is N, and grid is N x N based on example
            const moduloGroup = (r + c) % 3;
            const originalColor = initialGridState[r][c];
            colorOccurrencesByModulo[moduloGroup][originalColor - 1]++;
        }
    }

    const groupTransformationCosts = Array.from({ length: 3 }, () => Array(numColors).fill(0));

    for (let groupIndex = 0; groupIndex < 3; groupIndex++) {
        for (let targetColorIndex = 0; targetColorIndex < numColors; targetColorIndex++) {
            let currentGroupTotalCost = 0;
            for (let sourceColorIndex = 0; sourceColorIndex < numColors; sourceColorIndex++) {
                if (sourceColorIndex === targetColorIndex) {
                    continue;
                }
                const countOfSourceColor = colorOccurrencesByModulo[groupIndex][sourceColorIndex];
                const costToChange = colorTransformCosts[sourceColorIndex][targetColorIndex];
                currentGroupTotalCost += countOfSourceColor * costToChange;
            }
            groupTransformationCosts[groupIndex][targetColorIndex] = currentGroupTotalCost;
        }
    }

    let lowestPossibleCost = Number.MAX_SAFE_INTEGER;

    for (let firstColorIdx = 0; firstColorIdx < numColors; firstColorIdx++) {
        for (let secondColorIdx = 0; secondColorIdx < numColors; secondColorIdx++) {
            if (firstColorIdx === secondColorIdx) {
                continue;
            }
            for (let thirdColorIdx = 0; thirdColorIdx < numColors; thirdColorIdx++) {
                if (thirdColorIdx === firstColorIdx || thirdColorIdx === secondColorIdx) {
                    continue;
                }
                const currentTotal = groupTransformationCosts[0][firstColorIdx] +
                                     groupTransformationCosts[1][secondColorIdx] +
                                     groupTransformationCosts[2][thirdColorIdx];
                lowestPossibleCost = Math.min(lowestPossibleCost, currentTotal);
            }
        }
    }

    console.log(lowestPossibleCost);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));