function verifySymmetry(value) {
  let start = 0;
  let end = value.length - 1;

  while (start < end) {
    if (value[start] !== value[end]) {
      return false;
    }

    start++;
    end--;
  }

  return true;
}

const receivedText = require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .trim();

console.log(
  verifySymmetry(receivedText)
    ? "PALINDROME"
    : "NOT_PALINDROME"
);