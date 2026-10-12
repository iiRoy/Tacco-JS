function reverseText(text) {
  return text
    .split("")
    .reverse()
    .join("");
}

function checkPalindrome(text) {
  const reversedText = reverseText(text);

  return reversedText === text;
}

const fs = require("fs");
const text = fs
  .readFileSync("/dev/stdin", "utf8")
  .trim();

const message = checkPalindrome(text)
  ? "PALINDROME"
  : "NOT_PALINDROME";

console.log(message);