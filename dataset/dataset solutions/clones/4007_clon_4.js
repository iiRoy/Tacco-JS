function Main(input) {
  const source = input.trim();
  const completeSource = source + "\n";

  let lineNumber = 0;
  let currentToken = "";
  let foundY = false;
  let position = 0;

  while (position < completeSource.length) {
    const character = completeSource[position];

    const isHorizontalSeparator =
      character === " " ||
      character === "\t" ||
      character === "\r";

    if (
      isHorizontalSeparator ||
      character === "\n"
    ) {
      if (
        lineNumber === 1 &&
        currentToken === "Y"
      ) {
        foundY = true;
      }

      currentToken = "";

      if (character === "\n") {
        if (lineNumber === 1) {
          break;
        }

        lineNumber += 1;
      }
    } else if (lineNumber === 1) {
      currentToken += character;
    }

    position += 1;
  }

  console.log(foundY ? "Four" : "Three");
}

const fs = require("fs");
const source = fs.readFileSync("/dev/stdin", "utf8");

Main(source);