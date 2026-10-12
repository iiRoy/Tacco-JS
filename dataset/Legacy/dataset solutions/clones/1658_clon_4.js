const InputProcessor = (function() {
    function* tokenIterator(text) {
        const parts = text.split(/\s+/);
        for (const part of parts) {
            yield part;
        }
    }

    function* parsedIterator(text, parserFunc) {
        const parts = text.split(/\s+/);
        for (const part of parts) {
            yield parserFunc(part);
        }
    }

    function createStringGetter(text) {
        const iter = tokenIterator(text);
        return () => iter.next().value;
    }

    function createIntegerGetter(text) {
        const iter = tokenIterator(text);
        return () => parseInt(iter.next().value, 10);
    }

    function createBigIntegerGetter(text) {
        const iter = tokenIterator(text);
        return () => BigInt(iter.next().value);
    }

    return {
        createStringGetter: createStringGetter,
        createIntegerGetter: createIntegerGetter,
        createBigIntegerGetter: createBigIntegerGetter
    };
})();

const fs = require('fs');

function processInput(inputLines) {
    const getNextNumber = InputProcessor.createIntegerGetter(inputLines);
    const cityCount = getNextNumber();
    const cityDetails = [];
    for (let k = 0; k < cityCount; k++) {
        const coordX = getNextNumber();
        const coordY = getNextNumber();
        const powerFactor = getNextNumber();
        cityDetails.push({ x: coordX, y: coordY, p: powerFactor, originalIdx: k });
    }
    console.log(computeMinimumCosts(cityCount, cityDetails).join('\n'));
}

function computeMinimumCosts(numCities, cityData) {
    const minimumCostsPerStationCount = Array(numCities + 1).fill(Number.MAX_SAFE_INTEGER);

    const xSortedIndices = Array.from({ length: numCities }, (_, i) => i).sort((a, b) => cityData[a].x - cityData[b].x);
    const ySortedIndices = Array.from({ length: numCities }, (_, i) => i).sort((a, b) => cityData[a].y - cityData[b].y);

    const totalCombinations = Math.pow(3, numCities);
    for (let comboId = 0; comboId < totalCombinations; comboId++) {
        const currentPlacementChoices = Array(numCities);
        let activeStationCount = 0;
        let tempComboId = comboId;

        for (let j = 0; j < numCities; j++) {
            const choiceType = tempComboId % 3; // 0: None, 1: X-axis, 2: Y-axis
            currentPlacementChoices[j] = choiceType;
            if (choiceType !== 0) {
                activeStationCount++;
            }
            tempComboId = Math.floor(tempComboId / 3);
        }

        const currentConfigurationCost = calculateConfigCost(numCities, cityData, currentPlacementChoices, xSortedIndices, ySortedIndices);
        minimumCostsPerStationCount[activeStationCount] = Math.min(minimumCostsPerStationCount[activeStationCount], currentConfigurationCost);
    }

    return minimumCostsPerStationCount;
}

function calculateConfigCost(numCities, cityData, choices, xIndices, yIndices) {
    const individualCityCosts = Array(numCities);

    for (let i = 0; i < numCities; i++) {
        if (choices[i] === 1 || choices[i] === 2) {
            individualCityCosts[i] = 0;
        } else {
            individualCityCosts[i] = Math.min(Math.abs(cityData[i].x), Math.abs(cityData[i].y)) * cityData[i].p;
        }
    }

    let lastXStationPosition = null;
    for (const cityIdx of xIndices) {
        if (choices[cityIdx] === 1) {
            lastXStationPosition = cityData[cityIdx].x;
        } else if (lastXStationPosition !== null) {
            individualCityCosts[cityIdx] = Math.min(individualCityCosts[cityIdx], Math.abs(cityData[cityIdx].x - lastXStationPosition) * cityData[cityIdx].p);
        }
    }

    lastXStationPosition = null;
    for (let k = numCities - 1; k >= 0; k--) {
        const cityIdx = xIndices[k];
        if (choices[cityIdx] === 1) {
            lastXStationPosition = cityData[cityIdx].x;
        } else if (lastXStationPosition !== null) {
            individualCityCosts[cityIdx] = Math.min(individualCityCosts[cityIdx], Math.abs(cityData[cityIdx].x - lastXStationPosition) * cityData[cityIdx].p);
        }
    }

    let lastYStationPosition = null;
    for (const cityIdx of yIndices) {
        if (choices[cityIdx] === 2) {
            lastYStationPosition = cityData[cityIdx].y;
        } else if (lastYStationPosition !== null) {
            individualCityCosts[cityIdx] = Math.min(individualCityCosts[cityIdx], Math.abs(cityData[cityIdx].y - lastYStationPosition) * cityData[cityIdx].p);
        }
    }

    lastYStationPosition = null;
    for (let k = numCities - 1; k >= 0; k--) {
        const cityIdx = yIndices[k];
        if (choices[cityIdx] === 2) {
            lastYStationPosition = cityData[cityIdx].y;
        } else if (lastYStationPosition !== null) {
            individualCityCosts[cityIdx] = Math.min(individualCityCosts[cityIdx], Math.abs(cityData[cityIdx].y - lastYStationPosition) * cityData[cityIdx].p);
        }
    }

    return individualCityCosts.reduce((total, current) => total + current, 0);
}

if (require.main === module) {
    const inputData = fs.readFileSync("/dev/stdin", "utf8");
    processInput(inputData);
}
