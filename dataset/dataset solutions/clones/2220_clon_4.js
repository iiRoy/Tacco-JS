const computeResult = (rawDataString) => {
    const allNumericTokens = rawDataString.match(/\d+/g);
    const firstValue = parseInt(allNumericTokens[0]); 
    const numberSequence = allNumericTokens.slice(1).map(Number);

    const computedState = numberSequence.reduce((accumulator, currentElement) => {
        if (currentElement <= accumulator.leastValueEncountered) {
            return {
                leastValueEncountered: currentElement,
                tally: accumulator.tally + 1
            };
        } else {
            return accumulator;
        }
    }, { leastValueEncountered: Infinity, tally: 0 });

    return computedState.tally;
};

const executeProgram = (sourcePathIdentifier) => {
    const fileContent = require("node:fs").readFileSync(sourcePathIdentifier, "utf8");
    const finalOutcome = computeResult(fileContent);
    console.log(finalOutcome);
};

executeProgram("/dev/stdin");