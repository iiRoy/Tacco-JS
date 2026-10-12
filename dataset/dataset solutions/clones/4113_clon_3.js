function getPriority(operator) {
  const priorities = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2
  };

  return priorities[operator] ?? 0;
}

function convertToPostfix(expression) {
  const source = expression.replace(/\s+/g, "");
  const output = [];
  const pendingOperators = [];
  let expectsOperand = true;
  let position = 0;

  if (source.length === 0) {
    return null;
  }

  while (position < source.length) {
    const token = source[position];

    if (/^[0-9]$/.test(token)) {
      if (!expectsOperand) {
        return null;
      }

      output.push(token);
      expectsOperand = false;
    } else if (token === "(") {
      if (!expectsOperand) {
        return null;
      }

      pendingOperators.push(token);
    } else if (token === ")") {
      if (expectsOperand) {
        return null;
      }

      let foundOpening = false;

      while (pendingOperators.length > 0) {
        const operator = pendingOperators.pop();

        if (operator === "(") {
          foundOpening = true;
          break;
        }

        output.push(operator);
      }

      if (!foundOpening) {
        return null;
      }

      expectsOperand = false;
    } else if ("+-*/".includes(token)) {
      if (expectsOperand) {
        return null;
      }

      while (
        pendingOperators.length > 0 &&
        pendingOperators[pendingOperators.length - 1] !== "(" &&
        getPriority(
          pendingOperators[pendingOperators.length - 1]
        ) >= getPriority(token)
      ) {
        output.push(pendingOperators.pop());
      }

      pendingOperators.push(token);
      expectsOperand = true;
    } else {
      return null;
    }

    position += 1;
  }

  if (expectsOperand) {
    return null;
  }

  while (pendingOperators.length > 0) {
    const operator = pendingOperators.pop();

    if (operator === "(") {
      return null;
    }

    output.push(operator);
  }

  return output;
}

function evaluatePostfix(tokens) {
  const values = [];

  for (const token of tokens) {
    if (/^[0-9]$/.test(token)) {
      values.push(Number(token));
      continue;
    }

    if (values.length < 2) {
      return null;
    }

    const right = values.pop();
    const left = values.pop();

    switch (token) {
      case "+":
        values.push(left + right);
        break;

      case "-":
        values.push(left - right);
        break;

      case "*":
        values.push(left * right);
        break;

      case "/":
        if (right === 0) {
          return null;
        }

        values.push(left / right);
        break;

      default:
        return null;
    }
  }

  return values.length === 1
    ? values[0]
    : null;
}

const fs = require("fs");
const expression = fs
  .readFileSync("/dev/stdin", "utf8")
  .trim();

const postfix = convertToPostfix(expression);
const result =
  postfix === null
    ? null
    : evaluatePostfix(postfix);

if (result === null || !Number.isFinite(result)) {
  console.log("INVALID");
} else {
  console.log(String(result));
}