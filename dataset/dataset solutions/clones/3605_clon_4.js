function displayResult(content) {
    console.log(content);
}

function countDivisors(numVal) {
    if (numVal === 1) return 1;
    let currentDivisorCount = 0;
    const limit = Math.sqrt(numVal);
    for (let k = 1; k <= limit; k++) {
        if (numVal % k === 0) {
            if (k * k === numVal) {
                currentDivisorCount++;
            } else {
                currentDivisorCount += 2;
            }
        }
    }
    return currentDivisorCount;
}

function processInput(rawInput) {
    const upperBound = parseInt(rawInput.trim(), 10);

    const finalTally = Array.from({ length: upperBound }, (_, idx) => idx + 1)
        .filter(num => num % 2 !== 0)
        .filter(num => countDivisors(num) === 8)
        .length;

    displayResult(finalTally);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
