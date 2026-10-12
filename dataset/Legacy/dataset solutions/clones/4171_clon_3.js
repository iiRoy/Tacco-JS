var processInput = function(rawData) {
    const inputLines = rawData.split("\n");
    const numberStrings = inputLines[1].split(" ");
    var numberArray = numberStrings.map(valueStr => parseInt(valueStr, 10));

    var divisionCounter = 0;

    const verifyAllEven = (arrToCheck) => {
        for (let idx = 0; idx < arrToCheck.length; idx++) {
            if (arrToCheck[idx] % 2 !== 0) {
                return false;
            }
        }
        return true;
    };

    const applyHalving = (originalArr) => {
        const halvedArray = [];
        for (let idx = 0; idx < originalArr.length; idx++) {
            halvedArray.push(originalArr[idx] / 2);
        }
        return halvedArray;
    };

    while (verifyAllEven(numberArray)) {
        numberArray = applyHalving(numberArray);
        divisionCounter++;
    }

    return divisionCounter;
};

const result = processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
console.log(result);
