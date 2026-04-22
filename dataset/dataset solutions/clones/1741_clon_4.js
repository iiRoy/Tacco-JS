function orchestrateProcessing(rawInput) {
    const contentLines = rawInput.trim().split(/\r?\n/);

    const controlLineParts = contentLines[0].split(/\s+/);
    const iterationCount = Number.parseInt(controlLineParts[1], 10);

    const numericStringValues = contentLines[1].split(/\s+/).filter(Boolean);
    const numericalEntities = numericStringValues.map(val => Number.parseInt(val, 10));

    const arrangedEntities = numericalEntities.slice().sort((valA, valB) => valA - valB);

    const summationResult = arrangedEntities.slice(0, iterationCount).reduce((accumulator, currentElement) => accumulator + currentElement, 0);

    console.log(summationResult);
}

orchestrateProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));