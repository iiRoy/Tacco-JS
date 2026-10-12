const fs = require("fs");
processInput(fs.readFileSync("/dev/stdin", "utf8"));

function processInput(rawData) {
    const parsedLines = rawData.split("\n");

    const COIN_500_VALUE = 500;
    const COIN_100_VALUE = 100;
    const COIN_50_VALUE = 50;

    const parseNumericValue = (str) => parseInt(str, 10);

    const num500YenCoins = parseNumericValue(parsedLines[0]);
    const num100YenCoins = parseNumericValue(parsedLines[1]);
    const num50YenCoins = parseNumericValue(parsedLines[2]);
    const targetSum = parseNumericValue(parsedLines[3]);

    let validCombinations = 0;

    const checkCombinationSum = (count500, count100, count50, target) => {
        const currentTotal = (COIN_500_VALUE * count500) + (COIN_100_VALUE * count100) + (COIN_50_VALUE * count50);
        return currentTotal === target;
    };

    for (let i500 = 0; i500 <= num500YenCoins; i500++) {
        for (let j100 = 0; j100 <= num100YenCoins; j100++) {
            for (let k50 = 0; k50 <= num50YenCoins; k50++) {
                if (checkCombinationSum(i500, j100, k50, targetSum)) {
                    validCombinations++;
                }
            }
        }
    }

    console.log(validCombinations);
}
