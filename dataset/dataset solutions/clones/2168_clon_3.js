function processInputData(rawData) {
    const LINE_DELIMITER = "\n";
    const FIELD_DELIMITER = " ";
    const DECREMENT_AMOUNT = 1;

    let inputLines = rawData.split(LINE_DELIMITER);

    let playerIdentifiers = inputLines[0].split(FIELD_DELIMITER);
    let currentScoresAsStrings = inputLines[1].split(FIELD_DELIMITER);
    let comparisonIdentifier = inputLines[2];

    let numericScores = currentScoresAsStrings.map(Number);

    let scoreIndexToAdjust;
    if (playerIdentifiers[0] === comparisonIdentifier) {
        scoreIndexToAdjust = 0;
    } else {
        scoreIndexToAdjust = 1;
    }

    numericScores[scoreIndexToAdjust] -= DECREMENT_AMOUNT;
    
    const finalScoreOutput = `${numericScores[0]} ${numericScores[1]}`;
    console.log(finalScoreOutput);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
