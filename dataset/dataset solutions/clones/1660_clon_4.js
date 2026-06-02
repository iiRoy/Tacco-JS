// --- Start of inlined io.ts clone ---
function* _tokenIterator(textLine) {
    const parts = textLine.split(/\s+/);
    for (const part of parts) {
        yield part;
    }
}

function getNext(inputLine) {
    const iteratorInstance = _tokenIterator(inputLine);
    return () => iteratorInstance.next().value;
}

function getNextInt(inputLine) {
    const iteratorInstance = _tokenIterator(inputLine);
    return () => parseInt(iteratorInstance.next().value, 10);
}

function getNextBigInt(inputLine) {
    const iteratorInstance = _tokenIterator(inputLine);
    return () => BigInt(iteratorInstance.next().value);
}
// --- End of inlined io.ts clone ---

const fileSystem = require('fs');

const SelectionType = {
    NONE: 0,
    X_AXIS: 1,
    Y_AXIS: 2
};

function calculateTotalCostForConfiguration({ totalCities, cityData, currentConfiguration, citiesSortedByX, citiesSortedByY }) {
    const individualCityCosts = cityData.map(city =>
        Math.min(Math.abs(city.xCoord), Math.abs(city.yCoord)) * city.priceFactor
    );

    let lastYBeaconXCoord = null;
    for (const city of citiesSortedByX) {
        if (currentConfiguration[city.originalPosition] === SelectionType.Y_AXIS) {
            lastYBeaconXCoord = city.xCoord;
            individualCityCosts[city.originalPosition] = 0;
        } else if (lastYBeaconXCoord !== null) {
            individualCityCosts[city.originalPosition] = Math.min(
                individualCityCosts[city.originalPosition],
                Math.abs(city.xCoord - lastYBeaconXCoord) * city.priceFactor
            );
        }
    }

    lastYBeaconXCoord = null;
    for (let i = totalCities - 1; i >= 0; i--) {
        const city = citiesSortedByX[i];
        if (currentConfiguration[city.originalPosition] === SelectionType.Y_AXIS) {
            lastYBeaconXCoord = city.xCoord;
            individualCityCosts[city.originalPosition] = 0;
        } else if (lastYBeaconXCoord !== null) {
            individualCityCosts[city.originalPosition] = Math.min(
                individualCityCosts[city.originalPosition],
                Math.abs(city.xCoord - lastYBeaconXCoord) * city.priceFactor
            );
        }
    }

    let lastXBeaconYCoord = null;
    for (const city of citiesSortedByY) {
        if (currentConfiguration[city.originalPosition] === SelectionType.X_AXIS) {
            lastXBeaconYCoord = city.yCoord;
            individualCityCosts[city.originalPosition] = 0;
        } else if (lastXBeaconYCoord !== null) {
            individualCityCosts[city.originalPosition] = Math.min(
                individualCityCosts[city.originalPosition],
                Math.abs(city.yCoord - lastXBeaconYCoord) * city.priceFactor
            );
        }
    }

    lastXBeaconYCoord = null;
    for (let i = totalCities - 1; i >= 0; i--) {
        const city = citiesSortedByY[i];
        if (currentConfiguration[city.originalPosition] === SelectionType.X_AXIS) {
            lastXBeaconYCoord = city.yCoord;
            individualCityCosts[city.originalPosition] = 0;
        } else if (lastXBeaconYCoord !== null) {
            individualCityCosts[city.originalPosition] = Math.min(
                individualCityCosts[city.originalPosition],
                Math.abs(city.yCoord - lastXBeaconYCoord) * city.priceFactor
            );
        }
    }

    return individualCityCosts.reduce((total, val) => total + val, 0);
}

function determineMinimumCosts({ totalCities, cityData }) {
    const resultCosts = Array(totalCities + 1).fill(Number.MAX_SAFE_INTEGER);

    const citiesSortedByX = [...cityData].sort((a, b) => a.xCoord - b.xCoord);
    const citiesSortedByY = [...cityData].sort((a, b) => a.yCoord - b.yCoord);

    const totalConfigurations = Math.pow(3, totalCities);

    for (let configIndex = 0; configIndex < totalConfigurations; configIndex++) {
        const currentConfiguration = Array(totalCities);
        let selectedAxisCount = 0;
        let tempConfigIndex = configIndex;

        for (let cityIdx = 0; cityIdx < totalCities; cityIdx++) {
            const choice = tempConfigIndex % 3;
            currentConfiguration[cityIdx] = choice;
            if (choice === SelectionType.X_AXIS || choice === SelectionType.Y_AXIS) {
                selectedAxisCount++;
            }
            tempConfigIndex = Math.floor(tempConfigIndex / 3);
        }

        const currentTotalCost = calculateTotalCostForConfiguration({
            totalCities,
            cityData,
            currentConfiguration,
            citiesSortedByX,
            citiesSortedByY,
        });

        resultCosts[selectedAxisCount] = Math.min(resultCosts[selectedAxisCount], currentTotalCost);
    }

    return resultCosts;
}

function main(inputData) {
    const getNextInteger = getNextInt(inputData);
    const totalCities = getNextInteger();
    const cityData = [];

    for (let idx = 0; idx < totalCities; idx++) {
        const xCoord = getNextInteger();
        const yCoord = getNextInteger();
        const priceFactor = getNextInteger();
        cityData.push({ xCoord, yCoord, priceFactor, originalPosition: idx });
    }

    console.log(determineMinimumCosts({ totalCities, cityData }).join('\n'));
}

exports.main = main;

if (require.main === module) {
    const inputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    main(inputContent);
}
