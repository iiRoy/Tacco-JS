function priority(symbol) {
  if (symbol === "+" || symbol === "-") {
    return 1;
  }

  if (symbol === "*" || symbol === "/") {
    return 2;
  }

  return 0;
}

function executePending(numbers, symbols) {
  if (numbers.length < 2 || symbols.length === 0) {
    return false;
  }

  const symbol = symbols.pop();
  const secondOperand = numbers.pop();
  const firstOperand = numbers.pop();
  let answer;

  if (symbol === "+") {
    answer = firstOperand + secondOperand;
  } else if (symbol === "-") {
    answer = firstOperand - secondOperand;
  } else if (symbol === "*") {
    answer = firstOperand * secondOperand;
  } else if (symbol === "/") {
    if (secondOperand === 0) {
      return false;
    }

    answer = firstOperand / secondOperand;
  } else {
    return false;
  }

  numbers.push(answer);

  return true;
}

function evaluateFormula(formula) {
  const compactFormula = formula.replace(/\s+/g, "");

  if (compactFormula.length === 0) {
    return null;
  }

  const numbers = [];
  const symbols = [];
  let needsOperand = true;

  for (
    let position = 0;
    position < compactFormula.length;
    position++
  ) {
    const character = compactFormula[position];

    if (/^[0-9]$/.test(character)) {
      if (!needsOperand) {
        return null;
      }

      numbers.push(Number(character));
      needsOperand = false;
    } else if (character === "(") {
      if (!needsOperand) {
        return null;
      }

      symbols.push(character);
      needsOperand = true;
    } else if (character === ")") {
      if (needsOperand) {
        return null;
      }

      while (
        symbols.length > 0 &&
        symbols[symbols.length - 1] !== "("
      ) {
        if (!executePending(numbers, symbols)) {
          return null;
        }
      }

      if (symbols.length === 0) {
        return null;
      }

      symbols.pop();
      needsOperand = false;
    } else if ("+-*/".includes(character)) {
      if (needsOperand) {
        return null;
      }

      while (
        symbols.length > 0 &&
        symbols[symbols.length - 1] !== "(" &&
        priority(symbols[symbols.length - 1]) >=
          priority(character)
      ) {
        if (!executePending(numbers, symbols)) {
          return null;
        }
      }

      symbols.push(character);
      needsOperand = true;
    } else {
      return null;
    }
  }

  if (needsOperand) {
    return null;
  }

  while (symbols.length > 0) {
    if (symbols[symbols.length - 1] === "(") {
      return null;
    }

    if (!executePending(numbers, symbols)) {
      return null;
    }
  }

  return numbers.length === 1
    ? numbers[0]
    : null;
}

const formula = require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .trim();

const answer = evaluateFormula(formula);

console.log(
  answer === null || !Number.isFinite(answer)
    ? "INVALID"
    : String(answer)
);