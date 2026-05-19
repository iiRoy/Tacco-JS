function processGame(rawData) {
    const lines = rawData.split("\n");
    const firstLineParts = lines[0].split(" ");

    const enemyCount = parseInt(firstLineParts[0]);
    const primaryDamage = parseInt(firstLineParts[1]);
    const secondaryDamage = parseInt(firstLineParts[2]);

    let enemyHealths = lines.slice(1, enemyCount + 1).map(Number);

    let turnCounter = 0;

    while (enemyHealths.some(hp => hp > 0)) {
        turnCounter++;

        const { maxHealthValue, targetIndex } = enemyHealths.reduce(
            (accumulator, currentHp, currentIndex) => {
                if (currentHp > accumulator.maxHealthValue) {
                    return { maxHealthValue: currentHp, targetIndex: currentIndex };
                }
                return accumulator;
            },
            { maxHealthValue: -Infinity, targetIndex: -1 }
        );

        enemyHealths = enemyHealths
            .map((hp, idx) => {
                return idx === targetIndex ? hp - primaryDamage : hp - secondaryDamage;
            })
            .filter(hp => hp > 0);
    }

    console.log('%s', turnCounter);
}

processGame(require("fs").readFileSync("/dev/stdin", "utf8"));
