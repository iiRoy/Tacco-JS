const obtainSource = () => {
    const nodeFileSys = globalThis.require("node:fs");
    return nodeFileSys.readFileSync(0, "utf8");
};

const transformInput = (textualData) => {
    const tokenizedParts = textualData.trim().split(/[\r\n\s]+/);
    const [valA, valB] = tokenizedParts.slice(0, 2).map(Number);

    const computedOutcome = (valB === 2)
        ? (valA - 1)
        : (Math.floor((valA - 2) / (valB - 1)) + 1);
    
    return computedOutcome;
};

const displayOutput = (numericResult) => {
    process.stdout.write(String(numericResult) + "\n");
};

const initiateProcess = () => {
    const initialText = obtainSource();
    const finalComputation = transformInput(initialText);
    displayOutput(finalComputation);
};

initiateProcess();