const fileSystem = require("fs");

const getParsedInput = (inputString) => {
    const tokens = inputString.split(/\s+/).filter(s => s.length > 0);
    let currentIndex = 0;
    return () => {
        if (currentIndex >= tokens.length) {
            throw new Error("Input exhausted.");
        }
        return parseInt(tokens[currentIndex++], 10);
    };
};

const ChoiceOption = Object.freeze({
    NONE: 0,
    X_AXIS_TOWER: 1,
    Y_AXIS_TOWER: 2,
});

function processCityData(inputReader) {
    const cityCount = inputReader();
    const cities = [];
    for (let k = 0; k < cityCount; k++) {
        const xCoord = inputReader();
        const yCoord = inputReader();
        const power = inputReader();
        cities.push({ x: xCoord, y: yCoord, p: power });
    }

    const minimumCostsPerTowerCount = Array(cityCount + 1).fill(Number.MAX_SAFE_INTEGER);

    const totalCombinations = Math.pow(3, cityCount);

    for (let comboIndex = 0; comboIndex < totalCombinations; comboIndex++) {
        const currentChoices = Array(cityCount);
        let currentTowerCount = 0;
        let tempComboIndex = comboIndex;

        for (let k = 0; k < cityCount; k++) {
            const choice = tempComboIndex % 3;
            currentChoices[k] = choice;
            if (choice === ChoiceOption.X_AXIS_TOWER || choice === ChoiceOption.Y_AXIS_TOWER) {
                currentTowerCount++;
            }
            tempComboIndex = Math.floor(tempComboIndex / 3);
        }

        let combinationCost = 0;

        const xTowerYCoords = [];
        const yTowerXCoords = [];

        for (let k = 0; k < cityCount; k++) {
            if (currentChoices[k] === ChoiceOption.X_AXIS_TOWER) {
                xTowerYCoords.push(cities[k].y);
            } else if (currentChoices[k] === ChoiceOption.Y_AXIS_TOWER) {
                yTowerXCoords.push(cities[k].x);
            }
        }

        xTowerYCoords.sort((a, b) => a - b);
        yTowerXCoords.sort((a, b) => a - b);

        for (let k = 0; k < cityCount; k++) {
            if (currentChoices[k] === ChoiceOption.NONE) {
                const currentCity = cities[k];
                let minCoverageCost = Math.min(Math.abs(currentCity.x), Math.abs(currentCity.y)) * currentCity.p;

                if (yTowerXCoords.length > 0) {
                    let low = 0, high = yTowerXCoords.length - 1;
                    let closestXDist = Number.MAX_SAFE_INTEGER;

                    while(low <= high) {
                        const mid = Math.floor((low + high) / 2);
                        const towerX = yTowerXCoords[mid];
                        const dist = Math.abs(currentCity.x - towerX);
                        closestXDist = Math.min(closestXDist, dist);

                        if (towerX < currentCity.x) {
                            low = mid + 1;
                        } else if (towerX > currentCity.x) {
                            high = mid - 1;
                        } else {
                            closestXDist = 0;
                            break;
                        }
                    }
                    minCoverageCost = Math.min(minCoverageCost, closestXDist * currentCity.p);
                }

                if (xTowerYCoords.length > 0) {
                    let low = 0, high = xTowerYCoords.length - 1;
                    let closestYDist = Number.MAX_SAFE_INTEGER;

                    while(low <= high) {
                        const mid = Math.floor((low + high) / 2);
                        const towerY = xTowerYCoords[mid];
                        const dist = Math.abs(currentCity.y - towerY);
                        closestYDist = Math.min(closestYDist, dist);

                        if (towerY < currentCity.y) {
                            low = mid + 1;
                        } else if (towerY > currentCity.y) {
                            high = mid - 1;
                        } else {
                            closestYDist = 0;
                            break;
                        }
                    }
                    minCoverageCost = Math.min(minCoverageCost, closestYDist * currentCity.p);
                }
                combinationCost += minCoverageCost;
            }
        }
        minimumCostsPerTowerCount[currentTowerCount] = Math.min(minimumCostsPerTowerCount[currentTowerCount], combinationCost);
    }

    console.log(minimumCostsPerTowerCount.join("\n"));
}

function main() {
    const rawInput = fileSystem.readFileSync("/dev/stdin", "utf8");
    const inputParser = getParsedInput(rawInput);
    processCityData(inputParser);
}

if (require.main === module) {
    main();
}

module.exports = {
    main: main
};
