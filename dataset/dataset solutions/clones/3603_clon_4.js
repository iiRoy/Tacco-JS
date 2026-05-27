function calculateProductFromInput(sourceText) {
    const numericValues = sourceText.split(" ").map(val => Number(val));
    const firstVal = numericValues[0];
    const secondVal = numericValues[1];
    const outcome = firstVal * secondVal - firstVal - secondVal + 1;
    console.log(outcome);
}
calculateProductFromInput(require("fs").readFileSync("/dev/stdin", "utf8"));
