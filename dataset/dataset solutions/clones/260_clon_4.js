function areAnagrams(firstWord, secondWord) {
  const first = firstWord.toLowerCase();
  const second = secondWord.toLowerCase();

  if (first.length !== second.length) {
    return false;
  }

  const frequencies = new Map();

  for (let index = 0; index < first.length; index++) {
    const letter = first[index];
    const currentAmount =
      frequencies.get(letter) ?? 0;

    frequencies.set(
      letter,
      currentAmount + 1
    );
  }

  for (let index = 0; index < second.length; index++) {
    const letter = second[index];
    const availableAmount =
      frequencies.get(letter) ?? 0;

    if (availableAmount === 0) {
      return false;
    }

    frequencies.set(
      letter,
      availableAmount - 1
    );
  }

  return true;
}

const fs = require("fs");
const lines = fs
  .readFileSync("/dev/stdin", "utf8")
  .trim()
  .split(/\r?\n/);

const firstWord = lines[0] ?? "";
const secondWord = lines[1] ?? "";
const result = areAnagrams(firstWord, secondWord);

console.log(
  result
    ? "ANAGRAM"
    : "NOT_ANAGRAM"
);