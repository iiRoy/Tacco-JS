function containSameLetters(original, candidate) {
  const orderedOriginal = original
    .toLowerCase()
    .split("")
    .sort()
    .join("");

  const orderedCandidate = candidate
    .toLowerCase()
    .split("")
    .sort()
    .join("");

  return orderedOriginal === orderedCandidate;
}

const lines = require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .trim()
  .split(/\r?\n/);

const original = lines[0] ?? "";
const candidate = lines[1] ?? "";

console.log(
  containSameLetters(original, candidate)
    ? "ANAGRAM"
    : "NOT_ANAGRAM"
);