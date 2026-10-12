function areAnagrams(firstWord, secondWord) {
  const normalizedFirst = firstWord
    .toLowerCase()
    .split("")
    .sort()
    .join("");

  const normalizedSecond = secondWord
    .toLowerCase()
    .split("")
    .sort()
    .join("");

  return normalizedFirst === normalizedSecond;
}

const input = require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .trim()
  .split(/\r?\n/);

const firstWord = input[0] ?? "";
const secondWord = input[1] ?? "";

console.log(
  areAnagrams(firstWord, secondWord)
    ? "ANAGRAM"
    : "NOT_ANAGRAM"
);