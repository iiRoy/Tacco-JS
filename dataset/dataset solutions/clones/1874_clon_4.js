const dataSource = require("node:fs").readFileSync("/dev/stdin", "utf8");

((sourceData) => {
    const textRows = sourceData.trim().split("\n");
    const [bookCount, skillCount, targetSkill] = textRows[0].split(" ").map(Number);

    const inventory = [];
    for (let currentBookIndex = 0; currentBookIndex < bookCount; currentBookIndex++) {
        const rowElements = textRows[currentBookIndex + 1].split(" ").map(Number);
        inventory.push({
            costValue: rowElements[0],
            proficiencyGains: rowElements.slice(1)
        });
    }

    let minimumSpend = Infinity;

    for (let combinationCode = 1; combinationCode < (1 << bookCount); combinationCode++) {
        let currentSpend = 0;
        const accumulatedProficiencies = Array(skillCount).fill(0);

        for (let bookIdentifier = 0; bookIdentifier < bookCount; bookIdentifier++) {
            if ((combinationCode >> bookIdentifier) & 1) {
                currentSpend += inventory[bookIdentifier].costValue;
                for (let proficiencyIndex = 0; proficiencyIndex < skillCount; proficiencyIndex++) {
                    accumulatedProficiencies[proficiencyIndex] += inventory[bookIdentifier].proficiencyGains[proficiencyIndex];
                }
            }
        }

        const allRequirementsMet = accumulatedProficiencies.every(level => level >= targetSkill);

        if (allRequirementsMet) {
            minimumSpend = Math.min(minimumSpend, currentSpend);
        }
    }

    console.log(minimumSpend === Infinity ? -1 : minimumSpend);

})(dataSource);