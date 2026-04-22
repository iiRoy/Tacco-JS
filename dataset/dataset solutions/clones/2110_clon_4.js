function processingUnit(incomingText) {
    const numericalComponent = parseFloat(incomingText);
    const derivedOutcome = (numericalComponent >>> 1) + ((numericalComponent & 1) ? 1 : 0.5);
    process.stdout.write(String(derivedOutcome) + '\n');
}

const fileOperations = require("fs");
const retrieveContent = (resourcePath, charSet) => fileOperations.readFileSync(resourcePath, charSet);
const completeData = retrieveContent("/dev/stdin", "utf8");

processingUnit(completeData);