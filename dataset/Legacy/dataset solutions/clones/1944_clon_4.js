function Main(rawInput) {
    const numericComponents = rawInput.split(" ").map(val => Number(val));

    const playerTwoInitialResource = numericComponents[0];
    const playerOneAttackPower = numericComponents[1];
    const playerOneInitialResource = numericComponents[2];
    const playerTwoAttackPower = numericComponents[3];

    function determineGameResult(currentP2Resource, currentP1Resource, isPlayerOneTurn) {
        if (currentP1Resource <= 0) {
            return "Yes";
        }
        if (currentP2Resource <= 0) {
            return "No";
        }

        if (isPlayerOneTurn) {
            const nextP1Resource = currentP1Resource - playerOneAttackPower;
            if (nextP1Resource <= 0) {
                return "Yes";
            } else {
                return determineGameResult(currentP2Resource, nextP1Resource, false);
            }
        } else {
            const nextP2Resource = currentP2Resource - playerTwoAttackPower;
            if (nextP2Resource <= 0) {
                return "No";
            } else {
                return determineGameResult(nextP2Resource, currentP1Resource, true);
            }
        }
    }

    const finalOutcome = determineGameResult(
        playerTwoInitialResource,
        playerOneInitialResource,
        true
    );

    console.log(finalOutcome);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
