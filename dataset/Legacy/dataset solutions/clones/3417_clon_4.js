const lengthMemo = new Map();
const pattyMemo = new Map();

function obtainTotalLength(level) {
    if (level === 0) return 1;
    if (lengthMemo.has(level)) return lengthMemo.get(level);
    const res = 2 * obtainTotalLength(level - 1) + 3;
    lengthMemo.set(level, res);
    return res;
}

function obtainTotalPatties(level) {
    if (level === 0) return 1;
    if (pattyMemo.has(level)) return pattyMemo.get(level);
    const res = 2 * obtainTotalPatties(level - 1) + 1;
    pattyMemo.set(level, res);
    return res;
}

function calculatePattiesAtPosition(currentLevel, currentPosition) {
    if (currentLevel === 0) {
        return currentPosition >= 1 ? 1 : 0;
    }

    const previousLevelLength = obtainTotalLength(currentLevel - 1);
    const previousLevelPatties = obtainTotalPatties(currentLevel - 1);

    // Structure: Bun + Layer(L-1) + Patty + Layer(L-1) + Bun
    // Lengths:   1   + previousLevelLength + 1 + previousLevelLength + 1

    if (currentPosition <= 1) { // Position is within the first Bun
        return 0;
    } else if (currentPosition <= 1 + previousLevelLength) { // Position is within the left Layer(L-1)
        return calculatePattiesAtPosition(currentLevel - 1, currentPosition - 1);
    } else if (currentPosition === 1 + previousLevelLength + 1) { // Position is the middle Patty
        return previousLevelPatties + 1;
    } else if (currentPosition <= 1 + previousLevelLength + 1 + previousLevelLength) { // Position is within the right Layer(L-1)
        return previousLevelPatties + 1 + calculatePattiesAtPosition(currentLevel - 1, currentPosition - (1 + previousLevelLength + 1));
    } else { // Position is the last Bun or beyond (if position is valid, it's the last bun)
        return previousLevelPatties + 1 + previousLevelPatties;
    }
}

function processInputAndCompute(inputString) {
    const lines = inputString.split("\n");
    const [levelCount, targetPosition] = lines[0].split(" ").map(Number);

    const finalResult = calculatePattiesAtPosition(levelCount, targetPosition);
    console.log('%s', finalResult);
}

function performDebugAction() {
  const inputData = document.getElementById("input").value;
  processInputAndCompute(inputData);
}

if (typeof require === 'function' && require.main === module) {
    processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));
}
