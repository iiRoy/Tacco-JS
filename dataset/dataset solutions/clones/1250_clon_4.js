const fs = require("fs");

const input = fs
    .readFileSync(0, "utf8")
    .trim()
    .split(/\s+/);

const [leftToken, rightToken, operatorSymbol] = input;

const leftOperand = Number(leftToken);
const rightOperand = Number(rightToken);

const operations = new Map([
    ["+", (left, right) => left + right],
    ["-", (left, right) => left - right],
    ["*", (left, right) => left * right],
    ["/", (left, right) => Math.floor(left / right)]
]);

const selectedOperation = operations.get(operatorSymbol);

if (selectedOperation) {
    const answer = selectedOperation(leftOperand, rightOperand);
    process.stdout.write(String(answer));
}