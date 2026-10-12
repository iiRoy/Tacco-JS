const parseNumericValue = (strValue) => parseInt(strValue, 10);

function processGameData(rawInputString) {
    const inputLines = rawInputString.split("\n");
    const firstLineTokens = inputLines[0].split(" ");

    let playerATokens = parseNumericValue(firstLineTokens[0]);
    let playerBTokens = parseNumericValue(firstLineTokens[1]);
    let actionCount = parseNumericValue(firstLineTokens[2]);

    let currentActionCount = actionCount;

    if (currentActionCount > playerATokens) {
        currentActionCount -= playerATokens;
        playerATokens = 0;

        playerBTokens -= currentActionCount;
        
        console.log(playerATokens, playerBTokens);
    } else {
        playerATokens -= currentActionCount;
        
        console.log(playerATokens, playerBTokens);
    }
}

processGameData(require("fs").readFileSync("/dev/stdin", "utf8"));
