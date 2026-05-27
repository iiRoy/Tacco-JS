function processGolemSpells(rawData) {
    const inputLines = rawData.split("\n");

    const [arenaSizeStr] = inputLines[0].split(" ");
    const arenaSize = parseInt(arenaSizeStr, 10);

    const arenaLayout = inputLines[1];

    let golemCounts = Array.from({ length: arenaSize }, () => 1);

    for (let k = 2; k < inputLines.length; k++) {
        const spellCommand = inputLines[k];
        if (!spellCommand) continue;

        const targetChar = spellCommand[0];
        const moveDirection = spellCommand[2];

        const nextGolemCounts = golemCounts.reduce((accumulator, currentCount, currentIdx) => {
            if (currentCount === 0) {
                return accumulator;
            }

            let destinationIdx = currentIdx;

            if (arenaLayout[currentIdx] === targetChar) {
                if (moveDirection === 'L') {
                    if (currentIdx > 0) {
                        destinationIdx = currentIdx - 1;
                    } else {
                        return accumulator;
                    }
                } else {
                    if (currentIdx < arenaSize - 1) {
                        destinationIdx = currentIdx + 1;
                    } else {
                        return accumulator;
                    }
                }
            }

            accumulator[destinationIdx] += currentCount;
            return accumulator;
        }, new Array(arenaSize).fill(0));

        golemCounts = nextGolemCounts;
    }

    const totalGolems = golemCounts.reduce((sum, count) => sum + count, 0);

    console.log(totalGolems);
}

processGolemSpells(require("fs").readFileSync("/dev/stdin", "utf8"));
