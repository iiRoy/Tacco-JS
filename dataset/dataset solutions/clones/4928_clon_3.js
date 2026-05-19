function processInputString(rawInputString) {
    const charArray = rawInputString.split("");
    let scoreAccumulator = 0;
    let goalCount = 0;
    let playerCount = 0;
    const CHAR_G = "g";
    const CHAR_P = "p";

    for (const currentChar of charArray) {
        const isPlayerCurrentlyBehind = playerCount < goalCount;

        switch (currentChar) {
            case CHAR_G:
                if (isPlayerCurrentlyBehind) {
                    scoreAccumulator++;
                    playerCount++;
                } else {
                    goalCount++;
                }
                break;
            case CHAR_P:
                if (isPlayerCurrentlyBehind) {
                    playerCount++;
                } else {
                    goalCount++;
                    scoreAccumulator--;
                }
                break;
        }
    }
    console.log(scoreAccumulator);
}
processInputString(require("fs").readFileSync("/dev/stdin", "utf8").trim());
