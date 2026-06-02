const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

((sourceText) => {
    const textLines = sourceText.split("\n");
    const [bookCount, skillTypeCount, targetSkillLevel] = textLines[0].split(" ").map(Number);

    const bookDetails = [];
    for (let idx = 0; idx < bookCount; idx++) {
        const lineParts = textLines[idx + 1].split(" ").map(Number);
        bookDetails.push({
            price: lineParts[0],
            skillIncrements: lineParts.slice(1)
        });
    }

    let minimumOverallCost = Infinity;

    const totalSubsets = 1 << bookCount;
    for (let subsetMask = 1; subsetMask < totalSubsets; subsetMask++) {
        let currentCost = 0;
        const currentSkills = Array(skillTypeCount).fill(0);

        for (let bookIndex = 0; bookIndex < bookCount; bookIndex++) {
            if ((subsetMask >> bookIndex) & 1) {
                const currentBook = bookDetails[bookIndex];
                currentCost += currentBook.price;

                for (let skillIdx = 0; skillIdx < skillTypeCount; skillIdx++) {
                    currentSkills[skillIdx] += currentBook.skillIncrements[skillIdx];
                }
            }
        }

        const allSkillsMet = currentSkills.every(skillLevel => skillLevel >= targetSkillLevel);

        if (allSkillsMet) {
            minimumOverallCost = Math.min(minimumOverallCost, currentCost);
        }
    }

    console.log(minimumOverallCost === Infinity ? -1 : minimumOverallCost);

})(rawData);
