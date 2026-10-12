function processInput(rawData) {
    const parts = rawData.trim().split(/\s+/).filter(Boolean);
    const parsedValues = [];
    let idx = 0;
    while (idx < parts.length) {
        parsedValues.push(Number(parts[idx]));
        idx++;
    }

    const firstValue = parsedValues[0];
    const secondValue = parsedValues[1];

    // The original condition `!args[0] <= 9 && args[1] <= 9`
    // evaluates to `true` for `!args[0] <= 9` because `!args[0]`
    // will be `true` (coerced to 1) if `args[0]` is 0, or `false` (coerced to 0)
    // if `args[0]` is any other number. Both 0 and 1 are `<= 9`.
    // Thus, the effective condition is solely `args[1] <= 9`.
    const isSecondValueWithinRange = secondValue <= 9;

    const finalResult = isSecondValueWithinRange ? (firstValue * secondValue) : -1;

    console.log(finalResult.toString());
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
