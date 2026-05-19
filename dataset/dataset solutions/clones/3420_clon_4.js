var inputLines = [];
var lineReader = require('readline');

var interfaceInstance = lineReader.createInterface({
    input: process.stdin,
    output: process.stdout,
});

interfaceInstance.on('line', function (currentLine) {
    inputLines.push(currentLine);
});

interfaceInstance.on('close', function () {
    var burgerDepth = Number(inputLines[0].split(" ")[0]);
    var consumptionLimit = Number(inputLines[0].split(" ")[1]);

    function computePatties(level, limit) {
        let currentLevel = level;
        let currentLimit = limit;
        let totalPattiesEaten = 0;

        while (true) {
            if (currentLevel === 0) {
                if (currentLimit >= 1) {
                    totalPattiesEaten += 1;
                }
                break;
            }

            // These values correspond to an (currentLevel-1) burger's properties
            // 'len' in original code for 'n' corresponds to (currentLevel-1) burger's total layers
            const lowerLevelBurgerLayers = Math.pow(2, currentLevel + 1) - 3;
            // 'num' in original code for 'n' corresponds to (currentLevel-1) burger's total patties
            const lowerLevelBurgerPatties = Math.pow(2, currentLevel) - 1;

            if (currentLimit === 1) { // Lunlun eats only the bottom bun
                break; // No patties consumed
            } else if (currentLimit <= lowerLevelBurgerLayers + 1) { // Lunlun eats into the first lower-level burger
                currentLimit -= 1; // Skip the bottom bun
                currentLevel -= 1; // Descend into the lower-level burger
            } else if (currentLimit === lowerLevelBurgerLayers + 2) { // Lunlun eats the first lower-level burger, bottom bun, and the middle patty
                totalPattiesEaten += lowerLevelBurgerPatties + 1; // Add patties from the lower-level burger plus the middle patty
                break;
            } else if (currentLimit <= (lowerLevelBurgerLayers + 1) * 2) { // Lunlun eats the first lower-level burger, bottom bun, middle patty, and into the second lower-level burger
                totalPattiesEaten += lowerLevelBurgerPatties + 1; // Add patties from the first half and the middle patty
                currentLimit -= (lowerLevelBurgerLayers + 2); // Adjust the consumption limit for the second lower-level burger
                currentLevel -= 1; // Descend into the second lower-level burger
            } else { // Lunlun eats the entire burger
                totalPattiesEaten += lowerLevelBurgerPatties * 2 + 1; // Add all patties from both lower-level burgers and the middle patty
                break;
            }
        }
        return totalPattiesEaten;
    }

    console.log(computePatties(burgerDepth, consumptionLimit));
});
