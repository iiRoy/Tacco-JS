function processText(sourceContent) {
  const replacementDigit = "8";
  const outputString = sourceContent.substring(0, 3) + replacementDigit + sourceContent.substring(4);
  console.log(outputString);
}

processText(require("fs").readFileSync("/dev/stdin", "utf8"));
