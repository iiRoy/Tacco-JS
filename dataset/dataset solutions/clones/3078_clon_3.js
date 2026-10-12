function compareOppositeCharacters(text, left, right) {
  if (left >= right) {
    return true;
  }

  const charactersMatch =
    text.charAt(left) === text.charAt(right);

  if (!charactersMatch) {
    return false;
  }

  return compareOppositeCharacters(
    text,
    left + 1,
    right - 1
  );
}

function isPalindrome(text) {
  const firstPosition = 0;
  const lastPosition = text.length - 1;

  return compareOppositeCharacters(
    text,
    firstPosition,
    lastPosition
  );
}

const fileSystem = require("fs");
const rawInput = fileSystem.readFileSync(
  "/dev/stdin",
  "utf8"
);
const text = rawInput.trim();
const palindrome = isPalindrome(text);

if (palindrome) {
  console.log("PALINDROME");
} else {
  console.log("NOT_PALINDROME");
}