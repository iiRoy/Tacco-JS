function processTreasureGame(rawGameData) {
    const lines = rawGameData.split("\n").filter(line => line.trim() !== "");
    const parameterSettings = lines[0].split(" ");
    const treasureCount = parseInt(parameterSettings[0], 10);
    const moveLimit = parseInt(parameterSettings[1], 10);

    const initialTreasurePile = lines[1].split(" ").map(str => parseInt(str, 10));

    const initialConfiguration = {
        bagContents: initialTreasurePile.slice(),
        pouchContents: []
    };

    let highestScore = 0;

    const tallyPouchGems = (pouch) => pouch.reduce((total, gem) => total + gem, 0);

    const retrieveFromFront = (currentConfig) => {
        if (currentConfig.bagContents.length === 0) return [];
        const nextBag = currentConfig.bagContents.slice(1);
        const nextPouch = currentConfig.pouchContents.concat(currentConfig.bagContents[0]);
        return [{ bagContents: nextBag, pouchContents: nextPouch }];
    };

    const retrieveFromBack = (currentConfig) => {
        if (currentConfig.bagContents.length === 0) return [];
        const nextBag = currentConfig.bagContents.slice(0, -1);
        const nextPouch = currentConfig.pouchContents.concat(currentConfig.bagContents[currentConfig.bagContents.length - 1]);
        return [{ bagContents: nextBag, pouchContents: nextPouch }];
    };

    const depositToFront = (currentConfig) => {
        if (currentConfig.pouchContents.length === 0) return [];
        const resultingConfigs = [];
        for (let idx = 0; idx < currentConfig.pouchContents.length; idx++) {
            const gemToMove = currentConfig.pouchContents[idx];
            const tempPouch = currentConfig.pouchContents.slice();
            tempPouch.splice(idx, 1);
            const nextBag = [gemToMove].concat(currentConfig.bagContents);
            resultingConfigs.push({ bagContents: nextBag, pouchContents: tempPouch });
        }
        return resultingConfigs;
    };

    const depositToBack = (currentConfig) => {
        if (currentConfig.pouchContents.length === 0) return [];
        const resultingConfigs = [];
        for (let idx = 0; idx < currentConfig.pouchContents.length; idx++) {
            const gemToMove = currentConfig.pouchContents[idx];
            const tempPouch = currentConfig.pouchContents.slice();
            tempPouch.splice(idx, 1);
            const nextBag = currentConfig.bagContents.concat(gemToMove);
            resultingConfigs.push({ bagContents: nextBag, pouchContents: tempPouch });
        }
        return resultingConfigs;
    };

    const allPossibleActions = [
        retrieveFromFront,
        retrieveFromBack,
        depositToFront,
        depositToBack
    ];

    const explorationQueue = [[initialConfiguration, 0]];
    let headIndex = 0;

    while (headIndex < explorationQueue.length) {
        const [currentConfig, currentMoveCount] = explorationQueue[headIndex++];

        const currentPouchSum = tallyPouchGems(currentConfig.pouchContents);
        if (currentPouchSum > highestScore) {
            highestScore = currentPouchSum;
        }

        if (currentMoveCount >= moveLimit) {
            continue;
        }

        for (const actionFn of allPossibleActions) {
            const nextConfigs = actionFn(currentConfig);
            for (const nextConfig of nextConfigs) {
                explorationQueue.push([nextConfig, currentMoveCount + 1]);
            }
        }
    }

    console.log(highestScore);
}

processTreasureGame(require("fs").readFileSync("/dev/stdin", "utf8"));