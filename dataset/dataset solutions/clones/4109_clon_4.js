const processInput = (inputData) => {
    const lines = inputData.trim().split("\n");
    const [firstLine] = lines;
    const [numItems, initialHealth] = firstLine.split(" ").map(Number);

    const itemStats = lines.slice(1, numItems + 1).map(itemLine => {
        const [offenseValue, damageValue] = itemLine.split(" ").map(Number);
        return { offense: offenseValue, damage: damageValue };
    });

    let topOffenseItem = { offense: 0, damage: 0 };
    let cumulativeThrowDamage = 0;

    itemStats.forEach(currentStat => {
        cumulativeThrowDamage += currentStat.damage;
        if (currentStat.offense > topOffenseItem.offense) {
            topOffenseItem = currentStat;
        }
    });

    if (cumulativeThrowDamage >= initialHealth) {
        console.log(numItems);
        return;
    }

    const remainingHealthAfterAllThrows = initialHealth - cumulativeThrowDamage;

    const necessarySwings = Math.ceil(remainingHealthAfterAllThrows / topOffenseItem.offense);

    console.log(necessarySwings);

    const finalTally = (numItems === 1)
        ? necessarySwings + 1
        : necessarySwings + (numItems - 1);

    console.log(finalTally);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
