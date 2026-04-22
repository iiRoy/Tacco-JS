const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");

(() => {
    const numericStrings = sourceData.match(/\d+/g);
    const primaryValue = Number(numericStrings[0]);
    const secondaryValue = Number(numericStrings[1]);

    const finalOutcome = Math.max(
        1,
        (primaryValue * secondaryValue + 1) >> 1
    );

    process.stdout.write(String(finalOutcome) + '\n');
})();