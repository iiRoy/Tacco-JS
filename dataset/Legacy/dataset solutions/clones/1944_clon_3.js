function processGameInput(rawInputString) {
    const stringParts = rawInputString.split(" ");
    const gameValues = stringParts.map(valStr => {
        const numericValue = Number(valStr);
        return numericValue;
    });

    let isFirstPlayerTurn = true;

    while (true) {
        if (isFirstPlayerTurn) {
            const playerOneDamage = gameValues[1];
            gameValues[2] = gameValues[2] - playerOneDamage;
            if (gameValues[2] <= 0) {
                console.log("Yes");
                break;
            }
        } else {
            const playerTwoDamage = gameValues[3];
            gameValues[0] = gameValues[0] - playerTwoDamage;
            if (gameValues[0] <= 0) {
                console.log("No");
                break;
            }
        }
        isFirstPlayerTurn = !isFirstPlayerTurn;
    }
}

processGameInput(require("fs").readFileSync("/dev/stdin", "utf8"));
