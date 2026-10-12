function entryPoint(inputString) {
    const inputLines = inputString.split('\n');
    const participantCount = Number(inputLines[0]);

    const numericScores = inputLines[1].split(' ').map(Number);

    const categorizationSummary = numericScores.reduce((accumulator, currentScoreValue) => {
        const categoryIndex = Math.floor(currentScoreValue / 400);
        if (categoryIndex >= 8) {
            accumulator.highLevelCount++;
        } else {
            accumulator.uniqueCategoryIndices.add(categoryIndex);
        }
        return accumulator;
    }, { uniqueCategoryIndices: new Set(), highLevelCount: 0 });

    const distinctCategoryArray = Array.from(categorizationSummary.uniqueCategoryIndices);
    const highLevelCount = categorizationSummary.highLevelCount;

    console.log(distinctCategoryArray);
    if (distinctCategoryArray[0]) {
        console.log(distinctCategoryArray.length + ' ' + (distinctCategoryArray.length + highLevelCount));
    } else {
        console.log(1 + ' ' + highLevelCount);
    }
}

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
