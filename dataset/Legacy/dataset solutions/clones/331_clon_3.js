const logOutput = console.log;

function createInputReader(rawData) {
    const NEWLINE_DELIMITER = "\n";
    const inputLines = rawData.split(NEWLINE_DELIMITER);
    return () => inputLines.shift();
}

function processGameData(gameInputString) {
    const getNextLine = createInputReader(gameInputString);

    const numGames = Number(getNextLine());
    const MAX_OUTS_PER_INNING = 3;

    for (let gameIndex = 0; gameIndex < numGames; gameIndex++) {
        let outsCount = 0;
        let runnersOnBase = 0;
        let currentScore = 0;

        while (outsCount < MAX_OUTS_PER_INNING) {
            const eventType = getNextLine();

            switch (eventType) {
                case 'HIT':
                    runnersOnBase++;
                    const isBasesLoadedAfterHit = (runnersOnBase === 4);
                    if (isBasesLoadedAfterHit) {
                        currentScore++;
                        runnersOnBase--;
                    }
                    break;
                case 'HOMERUN':
                    const pointsFromHomerun = runnersOnBase + 1;
                    currentScore += pointsFromHomerun;
                    runnersOnBase = 0;
                    break;
                default:
                    outsCount++;
                    break;
            }
        }
        logOutput(currentScore);
    }
}

processGameData(require("fs").readFileSync("/dev/stdin", "utf8"));
