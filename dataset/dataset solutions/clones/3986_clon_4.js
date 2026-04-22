function checkSymmetry(numeral) {
    if (numeral < 0) return false;
    let original = numeral;
    let reversed = 0;
    while (numeral > 0) {
        reversed = reversed * 10 + (numeral % 10);
        numeral = Math.floor(numeral / 10);
    }
    return original === reversed;
}

function processNumberRange(inputDataLines) {
    const [start, end] = inputDataLines[0].split(" ").map(Number);

    const tally = Array.from({ length: end - start + 1 }, (_, index) => start + index)
                       .filter(checkSymmetry)
                       .length;

    console.info(tally);
}

const sourceMaterial = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");
processNumberRange(sourceMaterial);