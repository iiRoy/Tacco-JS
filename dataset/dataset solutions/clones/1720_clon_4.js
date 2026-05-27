function calculatePolynomialSum(sourceContent) {
    const contentLines = sourceContent.split("\n");
    const baseNumber = Number.parseInt(contentLines[0], 10);

    const exponentsToSum = [1, 2, 3];
    const powerTerms = exponentsToSum.map(expValue => Math.pow(baseNumber, expValue));
    const finalResult = powerTerms.reduce((accumulator, currentTerm) => accumulator + currentTerm, 0);

    console.log(finalResult);
}
calculatePolynomialSum(require("fs").readFileSync("/dev/stdin", "utf8"));
