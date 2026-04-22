const analyzeScores = (rawText) => {
    const textParts = rawText.split('\n');
    const expectedItemCount = Number(textParts[0]);
    const parsedNumbers = textParts[1].split(' ').map(Number);

    const itemsToEvaluate = Array.from({ length: expectedItemCount }, (_, idx) => parsedNumbers[idx]);

    const categorizationResult = itemsToEvaluate.reduce((accumulatorObject, currentScore) => {
        const groupIdentifier = Math.floor(currentScore / 400);
        if (groupIdentifier > 7) {
            accumulatorObject.excessiveRank++;
        } else {
            accumulatorObject.distinctGroupings.add(groupIdentifier);
        }
        return accumulatorObject;
    }, { distinctGroupings: new Set(), excessiveRank: 0 });

    const uniqueCategoryAmount = categorizationResult.distinctGroupings.size;
    const totalCategoryOutput = uniqueCategoryAmount + categorizationResult.excessiveRank;

    console.log(uniqueCategoryAmount, totalCategoryOutput);
};

analyzeScores(require("fs").readFileSync("/dev/stdin", "utf8"));