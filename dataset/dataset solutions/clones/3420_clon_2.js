let inputData = [];
let processor; // This variable is declared but not assigned or used.

const lineReaderModule = require('readline');

const interfaceHandler = lineReaderModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

interfaceHandler.on('line', function (currentLine) {
    inputData.push(currentLine);
});

interfaceHandler.on('close', function () {

    /*
     * This block processes the input data after all lines have been read.
     * The original comment indicated a potential Time Limit Exceeded issue,
     * but the current implementation is recursive.
     */

    const burgerLevel = Number(inputData[0].split(" ")[0]);
    const eatAmount = Number(inputData[0].split(" ")[1]);

    let finalCount = 0; // This variable is declared but not utilized in the final output.

    // Formula for the total length (number of layers) of a level 'n' burger:
    // L_n = 2 * L_{n-1} + 3
    // L_n + 3 = 2 * (L_{n-1} + 3)
    // L_n + 3 = 2^n * (L_0 + 3)
    // Given L_0 = 1 (bun-patty-bun), L_0 + 3 = 4
    // L_n + 3 = 2^n * 4 = 2^n * 2^2 = 2^(n+2)
    // So, L_n = 2^(n+2) - 3

    // Formula for the number of patties in a level 'n' burger:
    // P_n = 2 * P_{n-1} + 1
    // P_n + 1 = 2 * (P_{n-1} + 1)
    // P_n + 1 = 2^n * (P_0 + 1)
    // Given P_0 = 1, P_0 + 1 = 2
    // P_n + 1 = 2^n * 2 = 2^(n+1)
    // So, P_n = 2^(n+1) - 1

    console.log(calculatePatties(burgerLevel, eatAmount));
});

// This function recursively calculates the number of patties eaten
// when consuming 'layersToEat' layers from a 'currentLevel' burger.
function calculatePatties(currentLevel, layersToEat) {
    const totalLength = Math.pow(2, currentLevel + 2) - 3; // Total number of layers in the current burger.
    const pattyCount = Math.pow(2, currentLevel + 1) - 1; // Total number of patties in the current burger.

    if (currentLevel === 0) {
        return (1); // A level 0 burger consists of a single patty.
    }

    if (layersToEat === 1) {
        return (0); // If only the very first layer is consumed, it's always a bun.
    } else if (layersToEat <= totalLength / 2 + 1) {
        // If the eaten portion is within the first half of the burger (including the middle bun of the lower level).
        return (calculatePatties(currentLevel - 1, layersToEat - 1));
    } else if (layersToEat === totalLength / 2 + 2) {
        // If the eaten portion includes the middle patty of the current burger.
        return (pattyCount / 2 + 1);
    } else if (layersToEat <= totalLength + 1) {
        // If the eaten portion extends beyond the middle patty but not the entire burger.
        return (pattyCount / 2 + 1 + calculatePatties(currentLevel - 1, layersToEat - (totalLength / 2 + 2)));
    } else {
        return (pattyCount); // If the entire burger is consumed.
    }

    // The 'layersToEat - 1' adjustment in recursive calls accounts for the bottom bun layer.
}
