function processGameData(rawData) {
    const trimmedInput = rawData.trim();
    const parsedTokens = trimmedInput.split(/\s|\n/);

    let taroScore = 0;
    let hanakoScore = 0;

    const DRAW_POINTS_PER_PLAYER = 1;
    const WIN_POINTS_FOR_WINNER = 3;

    const numRounds = parseInt(parsedTokens.shift(), 10);

    for (let roundIndex = 0; roundIndex < numRounds; roundIndex++) {
        const taroCard = parsedTokens.shift();
        const hanakoCard = parsedTokens.shift();

        let currentTaroPoints = 0;
        let currentHanakoPoints = 0;

        if (taroCard === hanakoCard) {
            currentTaroPoints = DRAW_POINTS_PER_PLAYER;
            currentHanakoPoints = DRAW_POINTS_PER_PLAYER;
        } else if (taroCard < hanakoCard) {
            currentHanakoPoints = WIN_POINTS_FOR_WINNER;
        } else { // taroCard > hanakoCard
            currentTaroPoints = WIN_POINTS_FOR_WINNER;
        }

        taroScore += currentTaroPoints;
        hanakoScore += currentHanakoPoints;
    }

    console.log(taroScore + " " + hanakoScore);
}

processGameData(require("fs").readFileSync("/dev/stdin", "utf8"));
