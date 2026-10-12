function determineOutcomeFromRaw(inputLine) {
    const components = inputLine.split(" ");
    const areIdentical = components[0] === components[1];
    const outcomeRegistry = new Map();
    outcomeRegistry.set(true, "H");
    outcomeRegistry.set(false, "D");
    return outcomeRegistry.get(areIdentical);
}

function processSystemInput(sourceData) {
    const finalResult = determineOutcomeFromRaw(sourceData);
    console.log(finalResult);
}

processSystemInput(require("fs").readFileSync("/dev/stdin", "utf8"));
