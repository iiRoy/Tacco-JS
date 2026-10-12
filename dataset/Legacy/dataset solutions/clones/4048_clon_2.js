ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

function ProcessInput(rawData) {
    const lines = rawData.split("\n");

    const num500YenCoins = parseInt(lines[0], 10);
    const num100YenCoins = parseInt(lines[1], 10);
    const num50YenCoins = parseInt(lines[2], 10);
    const targetAmount = parseInt(lines[3], 10);

    let validCombinations = 0;

    for (let idx500 = 0; idx500 <= num500YenCoins; idx500++) {
        for (let idx100 = 0; idx100 <= num100YenCoins; idx100++) {
            for (let idx50 = 0; idx50 <= num50YenCoins; idx50++) {
                if ((500 * idx500 + 100 * idx100 + 50 * idx50) === targetAmount) {
                    validCombinations++;
                }
            }
        }
    }

    console.log(validCombinations);
}
