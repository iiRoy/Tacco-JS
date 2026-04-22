for (
  entryIndex = 1;

  currentEntry = require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .split(/\s/)[entryIndex++];
)
  (
    digitSequence = currentEntry.split('')
  ),
  console.log(
    digitSequence
      .sort(function (valueA, valueB) {
        return valueB - valueA;
      })
      .join('')
    -
    digitSequence
      .sort()
      .join('')
  );