const sourceContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const rawLines = sourceContent.trim().split("\n");

rawLines.filter(line => line !== "0 0").forEach(gameLine => {
    const gameParameters = gameLine.split(" ").map(Number);
    const playerCount = gameParameters[0];
    const initialTokens = gameParameters[1];
    const winningScore = initialTokens;

    const initialHoldings = Array.from({ length: playerCount }, () => 0);

    function simulatePass(state) {
        const { currentTokens, holdings, activeParticipant, targetScore } = state;

        const nextParticipant = (activeParticipant + 1) % holdings.length;

        if (currentTokens > 0) {
            const updatedHoldings = [...holdings];
            updatedHoldings[activeParticipant]++;

            if (currentTokens === 1 && updatedHoldings[activeParticipant] === targetScore) {
                return activeParticipant;
            }

            return simulatePass({
                currentTokens: currentTokens - 1,
                holdings: updatedHoldings,
                activeParticipant: nextParticipant,
                targetScore: targetScore
            });
        } else {
            const tokensToRedistribute = holdings[activeParticipant];
            const updatedHoldings = [...holdings];
            updatedHoldings[activeParticipant] = 0;

            return simulatePass({
                currentTokens: tokensToRedistribute,
                holdings: updatedHoldings,
                activeParticipant: nextParticipant,
                targetScore: targetScore
            });
        }
    }

    const gameWinner = simulatePass({
        currentTokens: initialTokens,
        holdings: initialHoldings,
        activeParticipant: 0,
        targetScore: winningScore
    });

    console.log(gameWinner);
});