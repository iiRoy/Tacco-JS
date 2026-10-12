function createOrderedSignature(word) {
  const letters = word.toLowerCase().split("");

  letters.sort();

  let signature = "";
  let position = 0;

  while (position < letters.length) {
    signature += letters[position];
    position += 1;
  }

  return signature;
}

function compareWordLetters(words) {
  if (words.length < 2) {
    return false;
  }

  const firstSignature =
    createOrderedSignature(words[0]);
  const secondSignature =
    createOrderedSignature(words[1]);

  if (firstSignature !== secondSignature) {
    return false;
  }

  return true;
}

const fs = require("fs");
const source = fs.readFileSync("/dev/stdin", "utf8");
const words = source.trim().split(/\r?\n/);
const sameLetters = compareWordLetters(words);

if (sameLetters) {
  console.log("ANAGRAM");
} else {
  console.log("NOT_ANAGRAM");
}