function analyzeCompetitionData(rawInputString) {
    const inputLines = rawInputString.split("\n");
    const participantCount = Number(inputLines[0]);
    const scoreStrings = inputLines[1].split(' ');

    const CATEGORY_DIVISOR = 400;
    const TOP_TIER_THRESHOLD = 8;

    let midTierCategories = [];
    let topTierCount = 0;

    const getScoreCategory = (scoreText) => {
        const numericScore = Number(scoreText);
        return Math.floor(numericScore / CATEGORY_DIVISOR);
    };

    for (const currentScoreText of scoreStrings) {
        const calculatedCategory = getScoreCategory(currentScoreText);

        if (calculatedCategory >= TOP_TIER_THRESHOLD) {
            topTierCount++;
        } else {
            midTierCategories.push(calculatedCategory);
        }
    }

    const uniqueMidTierCategoriesSet = new Set(midTierCategories);
    const distinctMidTierCategories = Array.from(uniqueMidTierCategoriesSet);

    console.log(distinctMidTierCategories);

    let firstOutputValue;
    let secondOutputValue;

    if (distinctMidTierCategories[0]) {
        firstOutputValue = distinctMidTierCategories.length;
        secondOutputValue = distinctMidTierCategories.length + topTierCount;
    } else {
        firstOutputValue = 1;
        secondOutputValue = topTierCount;
    }

    console.log(`${firstOutputValue} ${secondOutputValue}`);
}

analyzeCompetitionData(require("fs").readFileSync("/dev/stdin", "utf8"));
