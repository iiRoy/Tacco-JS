function handleCompetitionScore(rawScoreString) {
    const trimmedInput = rawScoreString.trim();
    const parsedScore = parseInt(trimmedInput, 10);

    let competitionCategoryResult;

    const getCategoryLabel = (scoreValue) => {
        if (scoreValue < 1200) {
            return "ABC";
        } else if (scoreValue < 2800) {
            return "ARC";
        } else {
            return "AGC";
        }
    };

    competitionCategoryResult = getCategoryLabel(parsedScore);

    console.log(competitionCategoryResult);
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
handleCompetitionScore(fileContent);
