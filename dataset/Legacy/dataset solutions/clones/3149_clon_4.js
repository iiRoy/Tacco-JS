const executeProgram = sourceText => {
    const parsedLines = sourceText.trim().split('\n');
    
    const initialIdentifier = parsedLines[0].split(" ")[0];

    const decisionMatrix = {
        "0": 1
    };
    
    const computedResult = decisionMatrix[initialIdentifier] || 0;

    console.log(computedResult);
};

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
