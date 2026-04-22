function processInput(sourceData) {
    const sections = sourceData.split("\n");

    const [individualCount, optionCount] = sections[0].split(" ").map(Number);

    const individualPreferences = sections.slice(1, individualCount + 1).map(personEntry => {
        const itemComponents = personEntry.split(" ").map(Number);
        return new Set(itemComponents.slice(1));
    });

    const availableChoices = Array.from({ length: optionCount }, (_, idx) => idx + 1);

    const unanimouslyApprovedChoices = availableChoices.filter(choiceCandidate => {
        return individualPreferences.every(individualChoiceSet => individualChoiceSet.has(choiceCandidate));
    });

    console.log(unanimouslyApprovedChoices.length);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));