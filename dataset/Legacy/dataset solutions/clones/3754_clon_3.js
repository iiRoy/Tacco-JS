function processInputData(rawInputString) {
    const inputLines = rawInputString.split("\n");
    const numberStringLine = inputLines[1];
    const numberStrings = numberStringLine.split(' ');
    const numbersArray = numberStrings.map(str => parseInt(str, 10));

    function countDivisionsByTwo(valueToProcess) {
        let divisionCount = 0;
        let tempValue = valueToProcess;
        while (tempValue % 2 === 0) {
            tempValue /= 2;
            divisionCount++;
        }
        return divisionCount;
    }

    const totalDivisions = numbersArray.reduce((accumulator, currentNumber) => {
        return accumulator + countDivisionsByTwo(currentNumber);
    }, 0);

    console.log(totalDivisions);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
