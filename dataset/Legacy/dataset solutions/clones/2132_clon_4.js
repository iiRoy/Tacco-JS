((sourceText) => {
    const [firstNumeric, secondNumeric] = sourceText.split(' ').map(Number);

    const primaryValue = firstNumeric;
    const secondaryValue = secondNumeric;

    const adjustmentFactor = Math.max(0, 10 - primaryValue);
    const finalOutcome = secondaryValue + 100 * adjustmentFactor;

    console.log(finalOutcome);
})(require("fs").readFileSync("/dev/stdin", "utf8"));
