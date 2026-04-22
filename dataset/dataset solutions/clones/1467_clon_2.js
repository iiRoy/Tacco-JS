systemRuntime.standardInputChannel.registerEvent(
    "receivedInput",
    function (
        inputData
    ) {
        let playerOneScore = 0,
            playerTwoScore = 0;

        const lineDelimiter = "\n";
        const valueSeparator = " ";
        const headerSkipCount = 1;

        String(inputData)
            .trim()
            .split(lineDelimiter)
            .slice(headerSkipCount)
            .some(
                function (
                    roundOutcomeString
                ) {
                    const roundScoresArray = roundOutcomeString.split(valueSeparator);

                    const val1 = parseInt(roundScoresArray[0], 10);
                    const val2 = parseInt(roundScoresArray[1], 10);

                    val1 === val2
                        ? (playerOneScore++, playerTwoScore++)
                        : val1 > val2
                        ? (playerOneScore += 3)
                        : (playerTwoScore += 3);
                }
            );

        outputDisplay.printLine(playerOneScore, playerTwoScore);
    }
)
    .beginStreamProcessing();