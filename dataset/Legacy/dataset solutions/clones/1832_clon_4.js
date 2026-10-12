function processInput(sourceText) {
  const modifiedContent = sourceText.replace(/\?/g, 'D');
  console.log(modifiedContent);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
