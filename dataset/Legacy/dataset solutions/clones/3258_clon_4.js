function Main(inputString) {
    let lines = inputString.split("\n");
    let countVal = parseInt(lines[0], 10);
    let numSequence = lines[1].split(" ").map(valStr => parseInt(valStr, 10));

    if (countVal === 0) {
        console.log(0);
        return;
    }

    let totalRise = numSequence.slice(1).reduce((currentSum, currentElement, indexInSliced) => {
        let previousElement = numSequence[indexInSliced];
        let gain = Math.max(0, currentElement - previousElement);
        return currentSum + gain;
    }, numSequence[0]);

    console.log(totalRise);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
