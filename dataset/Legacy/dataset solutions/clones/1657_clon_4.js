const MAX_POSSIBLE_COST = 1 << 30;

const ASSIGNMENT_NONE = 'NONE_OPTION';
const ASSIGNMENT_X_FACILITY = 'X_AXIS_FACILITY';
const ASSIGNMENT_Y_FACILITY = 'Y_AXIS_FACILITY';

function calculateCombinationCost(cityDetails, currentAssignment) {
    const citiesWithXFacilities = cityDetails.filter((_, idx) => currentAssignment[idx] === ASSIGNMENT_X_FACILITY);
    const citiesWithYFacilities = cityDetails.filter((_, idx) => currentAssignment[idx] === ASSIGNMENT_Y_FACILITY);
    const citiesWithoutFacilities = cityDetails.filter((_, idx) => currentAssignment[idx] === ASSIGNMENT_NONE);

    const xFacilityCoordinates = citiesWithXFacilities.map(c => c.xCoord);
    const yFacilityCoordinates = citiesWithYFacilities.map(c => c.yCoord);

    const totalCurrentCost = citiesWithoutFacilities.reduce((accumulator, currentCity) => {
        let individualCityCost = Math.min(Math.abs(currentCity.xCoord), Math.abs(currentCity.yCoord)) * currentCity.power;

        individualCityCost = xFacilityCoordinates.reduce((minCostSoFar, facilityX) => {
            return Math.min(minCostSoFar, Math.abs(currentCity.xCoord - facilityX) * currentCity.power);
        }, individualCityCost);

        individualCityCost = yFacilityCoordinates.reduce((minCostSoFar, facilityY) => {
            return Math.min(minCostSoFar, Math.abs(currentCity.yCoord - facilityY) * currentCity.power);
        }, individualCityCost);

        return accumulator + individualCityCost;
    }, 0);

    return totalCurrentCost;
}

function determineMinimumCosts(cityCount, cityDetails) {
    const minCostsPerFacilityCount = Array(cityCount + 1).fill(MAX_POSSIBLE_COST);

    const totalCombinations = Math.pow(3, cityCount);

    for (let comboIndex = 0; comboIndex < totalCombinations; comboIndex++) {
        let tempComboIndex = comboIndex;
        const currentAssignment = Array(cityCount);
        let facilityCounter = 0;

        for (let idx = 0; idx < cityCount; idx++) {
            const remainder = tempComboIndex % 3;
            if (remainder === 0) {
                currentAssignment[idx] = ASSIGNMENT_NONE;
            } else if (remainder === 1) {
                currentAssignment[idx] = ASSIGNMENT_X_FACILITY;
                facilityCounter++;
            } else {
                currentAssignment[idx] = ASSIGNMENT_Y_FACILITY;
                facilityCounter++;
            }
            tempComboIndex = Math.floor(tempComboIndex / 3);
        }

        const currentCombinationCost = calculateCombinationCost(cityDetails, currentAssignment);

        minCostsPerFacilityCount[facilityCounter] = Math.min(minCostsPerFacilityCount[facilityCounter], currentCombinationCost);
    }

    return minCostsPerFacilityCount;
}

function processInputAndSolve(inputLine) {
    const inputTokens = inputLine.split(/\s+/).filter(t => t.length > 0);
    let tokenIndex = 0;
    const getNextInteger = () => parseInt(inputTokens[tokenIndex++]);

    const cityCount = getNextInteger();
    const cityDetails = [];

    for (let idx = 0; idx < cityCount; idx++) {
        const xCoord = getNextInteger();
        const yCoord = getNextInteger();
        const power = getNextInteger();
        cityDetails.push({ xCoord, yCoord, power });
    }

    console.log(determineMinimumCosts(cityCount, cityDetails).join('\n'));
}

if (typeof module !== 'undefined' && module.exports && require.main === module) {
    const fileSystem = require('fs');
    const inputData = fileSystem.readFileSync("/dev/stdin", "utf8");
    processInputAndSolve(inputData);
}

exports.main = processInputAndSolve;
