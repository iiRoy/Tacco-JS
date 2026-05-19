"use strict";
var input = require("fs").readFileSync("/dev/stdin", "utf8");
var cin = input.split(/ |\n/),
    cid = 0;

const retrieveNextNumber = () => +cin[cid++];

const retrieveNextString = () => cin[cid++];

const retrieveNextBigInt = () => BigInt(cin[cid++]);

const retrieveNextArray = (count, asStrings) =>
    asStrings ? cin.slice(cid, (cid += count)) : cin.slice(cid, (cid += count)).map((val) => +val);

const retrieveNextMatrix = (height, width, asStrings) => {
    const resultMatrix = [];
    let currentRow = 0;
    if (asStrings) {
        for (; currentRow < height; currentRow++) {
            resultMatrix.push(cin.slice(cid, (cid += width)));
        }
    } else {
        for (; currentRow < height; currentRow++) {
            resultMatrix.push(cin.slice(cid, (cid += width)).map((val) => +val));
        }
    }
    return resultMatrix;
};

const createMultiDimArray = (...args) => {
    const initialValue = args[0];
    const dimensions = args.slice(1);

    const recursiveBuilder = (dims) => {
        if (dims.length === 0) {
            return initialValue;
        }
        const currentDimensionSize = dims[0];
        const remainingDimensions = dims.slice(1);
        return Array.from({ length: currentDimensionSize }, () => recursiveBuilder(remainingDimensions));
    };
    return recursiveBuilder(dimensions);
};

console.log(processSolution().toString());

function processSolution() {
    const switchCount = retrieveNextNumber();
    const bulbCount = retrieveNextNumber();

    const switchConnectionsPerBulb = createMultiDimArray(0, bulbCount);
    const bulbSwitchIndices = createMultiDimArray(0, bulbCount);

    for (let i = 0; i < bulbCount; i++) {
        switchConnectionsPerBulb[i] = retrieveNextNumber();
        bulbSwitchIndices[i] = retrieveNextArray(switchConnectionsPerBulb[i]).map((val) => val - 1);
    }
    const requiredParities = retrieveNextArray(bulbCount);

    let totalValidConfigurations = 0;

    const exploreSwitchStates = (currentSwitchIndex, currentSwitchStates) => {
        if (currentSwitchIndex === switchCount) {
            const allBulbsSatisfied = requiredParities.every((requiredParity, bulbIdx) => {
                const connectedSwitchIndices = bulbSwitchIndices[bulbIdx];
                const activeConnectedSwitchCount = connectedSwitchIndices.filter(
                    (sIdx) => currentSwitchStates[sIdx] === 1
                ).length;
                return (activeConnectedSwitchCount % 2) === requiredParity;
            });

            if (allBulbsSatisfied) {
                totalValidConfigurations++;
            }
            return;
        }

        exploreSwitchStates(currentSwitchIndex + 1, [...currentSwitchStates, 0]);
        exploreSwitchStates(currentSwitchIndex + 1, [...currentSwitchStates, 1]);
    };

    exploreSwitchStates(0, []);

    return totalValidConfigurations;
}
