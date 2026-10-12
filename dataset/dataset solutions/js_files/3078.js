function isPalindrome(text) {
  let left = 0;
  let right = text.length - 1;

  while (left < right) {
    if (text[left] !== text[right]) {
      return false;
    }

    left++;
    right--;
  }

  return true;
}

const input = require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .trim();

console.log(
  isPalindrome(input)
    ? "PALINDROME"
    : "NOT_PALINDROME"
);