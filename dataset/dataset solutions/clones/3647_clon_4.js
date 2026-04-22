function InitiateCalculation(rawTextData) {
    const inputSegments = rawTextData.trim().split(/\s+/);
    const targetString = inputSegments[0];

    const characterSet = ['A', 'B', 'C'];
    const numericalModulus = 1000000007;
    const textSequenceLength = targetString.length;

    const computationCache = new Map();

    function determineSubsequencePaths(currentIdx, patternProgress) {
        if (patternProgress === characterSet.length) {
            return 1;
        }
        if (currentIdx === textSequenceLength) {
            return 0;
        }

        const memoKey = `${currentIdx}-${patternProgress}`;
        if (computationCache.has(memoKey)) {
            return computationCache.get(memoKey);
        }

        let totalWays = 0;
        const currentCharacter = targetString[currentIdx];

        let waysFromNextChar = determineSubsequencePaths(currentIdx + 1, patternProgress);
        if (currentCharacter === '?') {
            waysFromNextChar = (waysFromNextChar * 3) % numericalModulus;
        }
        totalWays = (totalWays + waysFromNextChar) % numericalModulus;

        if (currentCharacter === '?' || currentCharacter === characterSet[patternProgress]) {
            totalWays = (totalWays + determineSubsequencePaths(currentIdx + 1, patternProgress + 1)) % numericalModulus;
        }

        computationCache.set(memoKey, totalWays);
        return totalWays;
    }

    const finalResult = determineSubsequencePaths(0, 0);
    console.log(finalResult);
}
if (typeof window == "undefined") InitiateCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));