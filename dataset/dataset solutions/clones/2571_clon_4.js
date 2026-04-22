((processInput) => {
    const fileSystemModule = require("node:fs");
    const inputBuffer = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    const numericalBase = processInput(inputBuffer);
    const calculatedResult = Math.pow(numericalBase, 3);
    process.stdout.write(String(calculatedResult) + "\n");
})(
    (sourceContent) => Number.parseInt(sourceContent.match(/^\d+/)[0], 10)
);