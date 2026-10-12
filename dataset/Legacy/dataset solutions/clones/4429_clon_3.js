function processInputString(sourceString) {
  const stringLength = sourceString.length;

  const firstCharacter = sourceString[0];

  const lastCharacter = sourceString[stringLength - 1];

  const innerSegmentLength = Math.max(0, stringLength - 2);

  const finalOutput = firstCharacter + innerSegmentLength + lastCharacter;

  console.log(finalOutput);
}

processInputString(require("fs").readFileSync("/dev/stdin", "utf8"));
