const entryPointForVerification = (externalSource) => {
    const processedContent = externalSource.trim();

    const sortedCharacters = Array.from(processedContent).sort();
    let currentSymbolTally = 0;
    let priorSymbol = '';
    let oddTallyDetected = false;

    sortedCharacters.push(null); 

    for (let charIndex = 0; charIndex < sortedCharacters.length; charIndex++) {
        const currentSymbol = sortedCharacters[charIndex];

        if (currentSymbol === priorSymbol || charIndex === 0) {
            currentSymbolTally++;
        } else {
            if (currentSymbolTally % 2 !== 0) {
                oddTallyDetected = true;
                break;
            }
            currentSymbolTally = 1; 
        }
        priorSymbol = currentSymbol;
    }

    if (oddTallyDetected) {
        console.log("No");
    } else {
        console.log("Yes");
    }
};

entryPointForVerification(require("fs").readFileSync("/dev/stdin", "utf8"));