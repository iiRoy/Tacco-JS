const acquireData = () => require('node:fs').readFileSync('/dev/stdin', 'utf8');

const parseInputData = (rawText) => rawText.trim().split('\n');

const commenceGameSequence = (gameInstructions) => {
    if (gameInstructions.length === 0) return;

    const [currentInstruction, ...remainingInstructions] = gameInstructions;

    if (currentInstruction === "0 0") return;

    const instructionParts = currentInstruction.split(" ");
    const totalParticipants = Number(instructionParts[0]);
    const initialCurrency = Number(instructionParts[1]);

    const winningParticipant = conductRound(totalParticipants, initialCurrency);
    if (winningParticipant !== undefined) {
        console.log(winningParticipant);
    }

    commenceGameSequence(remainingInstructions);
};

const conductRound = (participantCount, startingValue) => {
    const initialState = {
        playerPossessions: Array.from({ length: participantCount }, () => 0),
        centralDepot: startingValue,
        currentTurnIndex: 0,
        totalAssets: 0,
        maximumIterations: 1000000
    };

    let currentState = initialState;

    while (currentState.currentTurnIndex < currentState.maximumIterations) {
        const { playerPossessions, centralDepot, currentTurnIndex, totalAssets } = currentState;

        const nextPlayerPossessions = [...playerPossessions];
        let nextCentralDepot = centralDepot;
        let nextTotalAssets = totalAssets;

        const activePlayerIdentifier = currentTurnIndex % participantCount;

        if (nextCentralDepot > 0) {
            nextCentralDepot--;
            nextPlayerPossessions[activePlayerIdentifier]++;
            nextTotalAssets++;

            if (nextCentralDepot === 0) {
                if (nextTotalAssets === nextPlayerPossessions[activePlayerIdentifier]) {
                    return activePlayerIdentifier;
                }
            }
        } else {
            nextCentralDepot += nextPlayerPossessions[activePlayerIdentifier];
            nextTotalAssets -= nextPlayerPossessions[activePlayerIdentifier];
            nextPlayerPossessions[activePlayerIdentifier] = 0;
        }

        currentState = {
            playerPossessions: nextPlayerPossessions,
            centralDepot: nextCentralDepot,
            currentTurnIndex: currentTurnIndex + 1,
            totalAssets: nextTotalAssets,
            maximumIterations: currentState.maximumIterations
        };
    }
    return undefined;
};

const allGameInstructions = parseInputData(acquireData());
commenceGameSequence(allGameInstructions);