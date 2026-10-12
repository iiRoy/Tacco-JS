function createParser(expression) {
  const source = expression.replace(/\s+/g, "");
  let position = 0;
  let invalid = source.length === 0;

  function parseFactor() {
    if (invalid || position >= source.length) {
      invalid = true;
      return 0;
    }

    const token = source[position];

    if (/^[0-9]$/.test(token)) {
      position += 1;
      return Number(token);
    }

    if (token === "(") {
      position += 1;

      const value = parseExpression();

      if (
        invalid ||
        source[position] !== ")"
      ) {
        invalid = true;
        return 0;
      }

      position += 1;
      return value;
    }

    invalid = true;
    return 0;
  }

  function parseTerm() {
    let value = parseFactor();

    while (
      !invalid &&
      (
        source[position] === "*" ||
        source[position] === "/"
      )
    ) {
      const operator = source[position];
      position += 1;

      const right = parseFactor();

      if (invalid) {
        return 0;
      }

      if (operator === "*") {
        value *= right;
      } else {
        if (right === 0) {
          invalid = true;
          return 0;
        }

        value /= right;
      }
    }

    return value;
  }

  function parseExpression() {
    let value = parseTerm();

    while (
      !invalid &&
      (
        source[position] === "+" ||
        source[position] === "-"
      )
    ) {
      const operator = source[position];
      position += 1;

      const right = parseTerm();

      if (invalid) {
        return 0;
      }

      if (operator === "+") {
        value += right;
      } else {
        value -= right;
      }
    }

    return value;
  }

  function evaluate() {
    const result = parseExpression();

    if (
      invalid ||
      position !== source.length ||
      !Number.isFinite(result)
    ) {
      return null;
    }

    return result;
  }

  return {
    evaluate
  };
}

const fs = require("fs");
const expression = fs
  .readFileSync("/dev/stdin", "utf8")
  .trim();

const parser = createParser(expression);
const result = parser.evaluate();

console.log(
  result === null
    ? "INVALID"
    : String(result)
);