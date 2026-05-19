function processInputData(inputString) {
    const dataLines = inputString.split("\n");
    const numericStrings = dataLines[0].split(" ");
    const initialNumbers = numericStrings.map(Number);

    const [firstNum, secondNum, thirdNum] = initialNumbers;

    if (firstNum === secondNum && secondNum === thirdNum) {
        if (firstNum % 2 !== 0) {
            return 0;
        } else {
            return -1;
        }
    }

    function calculateSteps(currentA, currentB, currentC, currentCount) {
        if (currentA % 2 !== 0 || currentB % 2 !== 0 || currentC % 2 !== 0) {
            return currentCount;
        }

        const nextA = (currentB + currentC) / 2;
        const nextB = (currentA + currentC) / 2;
        const nextC = (currentB + currentA) / 2;

        return calculateSteps(nextA, nextB, nextC, currentCount + 1);
    }

    return calculateSteps(firstNum, secondNum, thirdNum, 0);
}

function Main(input) {
    const result = processInputData(input);
    console.log(result);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
