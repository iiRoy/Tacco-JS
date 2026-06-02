const processInput = (inputString) => {
    const inputLines = inputString.split("\n");

    const numberOfEntries = parseInt(inputLines[0], 10);

    const rollDataLines = inputLines.slice(1);

    const checkRollsMatch = (rollA, rollB) => {
        return rollA === rollB;
    };

    let currentConsecutiveDoubles = 0;
    let hasFoundThreeConsecutive = false;
    const TARGET_CONSECUTIVE_DOUBLES = 3;

    for (let entryIndex = 0; entryIndex < numberOfEntries; entryIndex++) {
        const currentLine = rollDataLines[entryIndex];
        const diceValues = currentLine.split(" ");
        const dieOneValue = diceValues[0];
        const dieTwoValue = diceValues[1];

        if (checkRollsMatch(dieOneValue, dieTwoValue)) {
            currentConsecutiveDoubles++;
            if (currentConsecutiveDoubles >= TARGET_CONSECUTIVE_DOUBLES) {
                hasFoundThreeConsecutive = true;
            }
        } else {
            currentConsecutiveDoubles = 0;
        }
    }

    console.log(hasFoundThreeConsecutive ? "Yes" : "No");
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
