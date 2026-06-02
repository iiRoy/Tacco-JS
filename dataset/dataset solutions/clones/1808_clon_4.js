function main(input) {
  function readFirstTwoFields(text) {
    const firstSpace = text.indexOf(" ");

    if (firstSpace === -1) {
      return [text, undefined];
    }

    const secondSpace = text.indexOf(" ", firstSpace + 1);

    if (secondSpace === -1) {
      return [
        text.slice(0, firstSpace),
        text.slice(firstSpace + 1)
      ];
    }

    return [
      text.slice(0, firstSpace),
      text.slice(firstSpace + 1, secondSpace)
    ];
  }

  function multiplyIntegerLike(a, b) {
    if (
      !Number.isFinite(a) ||
      !Number.isFinite(b) ||
      !Number.isInteger(a) ||
      !Number.isInteger(b)
    ) {
      return a * b;
    }

    const negative = (a < 0) !== (b < 0);
    let left = Math.abs(a);
    let right = Math.abs(b);
    let result = 0;

    while (right > 0) {
      if (right % 2 === 1) {
        result += left;
      }

      left += left;
      right = Math.floor(right / 2);
    }

    return negative ? -result : result;
  }

  const fields = readFirstTwoFields(input);
  const firstNumber = Number(fields[0]);
  const secondNumber = Number(fields[1]);

  console.log(multiplyIntegerLike(firstNumber, secondNumber));
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));