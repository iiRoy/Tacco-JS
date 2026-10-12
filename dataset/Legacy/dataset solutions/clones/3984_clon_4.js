function Main(inputData) {
    const dataSegments = inputData.split(" ");
    const startValue = Number.parseInt(dataSegments[0], 10);
    const endValue = Number.parseInt(dataSegments[1], 10);

    const checkNumericalSymmetry = (valueToCheck) => {
        if (valueToCheck < 0) {
            return false;
        }
        if (valueToCheck < 10) {
            return true;
        }

        let originalValue = valueToCheck;
        let reversedValue = 0;
        let temporaryValue = valueToCheck;

        while (temporaryValue > 0) {
            reversedValue = (reversedValue * 10) + (temporaryValue % 10);
            temporaryValue = Math.floor(temporaryValue / 10);
        }
        return originalValue === reversedValue;
    };

    const palindromeCount = Array.from({ length: endValue - startValue + 1 }, (_, index) => startValue + index)
                               .filter(checkNumericalSymmetry)
                               .length;

    console.log(palindromeCount);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
