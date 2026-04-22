const retrieveData = () => require("node:fs").readFileSync("/dev/stdin", "utf8").trim();
const formatAndDisplay = (content) => console.log(content);

const determineOriginalValue = (targetAmount) => {
    const taxRateMultiplier = 1.08;
    let potentialBase = Math.floor(targetAmount / taxRateMultiplier);

    for (let currentCandidate = potentialBase - 1; currentCandidate <= potentialBase + 2; ++currentCandidate) {
        if (currentCandidate < 0) continue; 

        const resultOfCalculation = Math.floor(currentCandidate * taxRateMultiplier);

        if (resultOfCalculation === targetAmount) {
            return currentCandidate;
        }
    }

    return ":(";
};

(() => {
    const rawInputString = retrieveData();
    const numericInput = parseInt(rawInputString, 10);
    formatAndDisplay(determineOriginalValue(numericInput));
})();