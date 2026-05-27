const fileSystem = require("fs");

const constantFactor = 211 / 27;

const processInputToken = (tokenValue) => {
    const numericValue = Number(tokenValue);
    const finalResult = numericValue * constantFactor;
    process.stdout.write(finalResult.toFixed(8) + "\n");
};

fileSystem.readFileSync("/dev/stdin", "utf8")
    .split(/\s/)
    .forEach(processInputToken);
