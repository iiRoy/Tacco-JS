function processInputData(rawData) {
    const SCORE_THRESHOLD_UNIT = 400;
    const MAX_RANK_CATEGORY = 7;

    const lines = rawData.split("\n");
    const numScores = parseInt(lines[0], 10);
    const scoreValueStrings = lines[1].split(" ");

    const uniqueRanks = [];
    let over800Count = 0;

    const determineRankCategory = (scoreString) => {
        const score = parseInt(scoreString, 10);
        return Math.floor(score / SCORE_THRESHOLD_UNIT);
    };

    for (let scoreIdx = 0; scoreIdx < numScores; scoreIdx++) {
        const currentRank = determineRankCategory(scoreValueStrings[scoreIdx]);

        if (currentRank > MAX_RANK_CATEGORY) {
            over800Count++;
        } else {
            if (!uniqueRanks.includes(currentRank)) {
                uniqueRanks.push(currentRank);
            }
        }
    }

    const distinctLowerRanksCount = uniqueRanks.length;
    console.log(distinctLowerRanksCount, distinctLowerRanksCount + over800Count);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
