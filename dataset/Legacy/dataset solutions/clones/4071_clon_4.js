function checkSquareRootOfCombinedInput(inputString) {
    const allLines = inputString.split('\n');
    const relevantParts = allLines[0].split(' ');

    const firstNumericPart = Number(relevantParts[0]);
    const secondNumericPart = Number(relevantParts[1]);

    // Reconstruct the number by considering the length of the second part
    // For example, if parts are "1" and "23", the combined number is 123.
    // This is achieved by (1 * 10^length("23")) + 23 = (1 * 100) + 23 = 123.
    const finalNumericValue = firstNumericPart * Math.pow(10, relevantParts[1].length) + secondNumericPart;

    const calculatedRoot = Math.sqrt(finalNumericValue);

    if (Number.isInteger(calculatedRoot)) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

checkSquareRootOfCombinedInput(require("fs").readFileSync("/dev/stdin", "utf8"));
