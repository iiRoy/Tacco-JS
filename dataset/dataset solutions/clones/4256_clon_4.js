const inputSource = require("node:fs");

const processor = (textData) => {
    const numericTarget = Number(textData.split('\n')[0]);

    if (numericTarget < 0) {
        return 1;
    }

    let lowerBound = 0;
    let upperBound = numericTarget;
    let foundRoot = 0;

    while (lowerBound <= upperBound) {
        const potentialRoot = Math.floor((lowerBound + upperBound) / 2);
        const currentSquare = potentialRoot * potentialRoot;

        if (currentSquare <= numericTarget) {
            foundRoot = potentialRoot;
            lowerBound = potentialRoot + 1;
        } else {
            upperBound = potentialRoot - 1;
        }
    }
    return foundRoot * foundRoot;
};

const acquiredData = inputSource.readFileSync("/dev/stdin", "utf8");
const finalOutcome = processor(acquiredData);
process.stdout.write(finalOutcome.toString() + '\n');