const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const allInputLines = fileContent.trim().split('\n');
let currentInputPointer = 0;

for (;;) {
    const headerData = allInputLines[currentInputPointer++].split(' ').map(Number);
    const [participantCount, categoryCount] = headerData;

    if (participantCount === 0 && categoryCount === 0) {
        break;
    }

    const scoreRegistry = new Map();
    for (let i = 1; i <= categoryCount; i++) {
        scoreRegistry.set(i, 0);
    }

    for (let i = 0; i < participantCount; i++) {
        const currentScores = allInputLines[currentInputPointer++].split(' ').map(Number);
        currentScores.forEach((scoreValue, categoryIndex) => {
            const categoryIdentifier = categoryIndex + 1;
            const existingScore = scoreRegistry.get(categoryIdentifier);
            scoreRegistry.set(categoryIdentifier, existingScore + scoreValue);
        });
    }

    const rankedCategories = Array.from(scoreRegistry.entries()).map(([id, total]) => ({
        categoryId: id,
        aggregateScore: total
    }));

    rankedCategories.sort((first, second) => {
        if (first.aggregateScore === second.aggregateScore) {
            return first.categoryId - second.categoryId;
        }
        return second.aggregateScore - first.aggregateScore;
    });

    const finalOrder = rankedCategories.map(item => item.categoryId);
    console.log(finalOrder.join(' '));
}
