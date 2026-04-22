const buildInputDispatcher = (rawTextContent) => {
    let allDataLines = rawTextContent.trim().split('\n');
    let currentLineIndex = 0;
    let parsedTokensOnCurrentLine = [];
    let currentLineFullyProcessed = true;

    const pullNextToken = () => {
        if (currentLineFullyProcessed) {
            if (currentLineIndex >= allDataLines.length) {
                throw new Error("No more data for token extraction.");
            }
            parsedTokensOnCurrentLine = allDataLines[currentLineIndex].split(' ').reverse();
            currentLineFullyProcessed = false;
        }

        const extractedToken = parsedTokensOnCurrentLine.pop();
        if (extractedToken === undefined) {
            // This case indicates the line was exhausted, and a new line should have been loaded.
            // If it happens, it means parsedTokensOnCurrentLine was empty but currentLineFullyProcessed was false.
            // This should not occur with the current logic flow if currentLineFullyProcessed is correctly maintained.
            // However, to be safe, we ensure line advance and re-attempt.
            currentLineIndex++;
            currentLineFullyProcessed = true;
            return pullNextToken();
        }

        if (parsedTokensOnCurrentLine.length === 0) {
            currentLineIndex++;
            currentLineFullyProcessed = true;
        }
        return Number(extractedToken);
    };

    const consumeLine = () => {
        if (currentLineIndex >= allDataLines.length) {
            throw new Error("No more data for line consumption.");
        }
        const lineContent = allDataLines[currentLineIndex++];
        parsedTokensOnCurrentLine = [];
        currentLineFullyProcessed = true;
        return lineContent.split(' ').map(Number);
    };

    return { pullNextToken, consumeLine };
};

const processData = (inputFeeder) => {
    const numParticipants = inputFeeder.pullNextToken();
    const numDistinctItems = inputFeeder.pullNextToken();

    const itemTallies = new Map();

    Array.from({ length: numParticipants }).forEach(() => {
        const participantChoices = inputFeeder.consumeLine();
        const currentChoiceCount = participantChoices[0];

        itemTallies.set(currentChoiceCount, (itemTallies.get(currentChoiceCount) || 0) + 1);

        for (let k = 1; k < currentChoiceCount; k++) {
            const chosenItem = participantChoices[k];
            itemTallies.set(chosenItem, (itemTallies.get(chosenItem) || 0) + 1);
        }
    });

    let unanimousSelections = 0;
    itemTallies.forEach(count => {
        if (count === numParticipants) {
            unanimousSelections++;
        }
    });

    return unanimousSelections;
};

const dataFeeder = buildInputDispatcher(require("fs").readFileSync("/dev/stdin","utf8"));
console.log(processData(dataFeeder));