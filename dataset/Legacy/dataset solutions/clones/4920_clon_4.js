function processInput(sourceString) {
  const stringLen = sourceString.length;
  const targetChar = 'p';

  const foundChars = sourceString.includes(targetChar)
                     ? Array.from(sourceString).filter(c => c === targetChar)
                     : null;

  const charOccurrences = foundChars.length;

  console.log(Math.floor(stringLen / 2 - charOccurrences));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
