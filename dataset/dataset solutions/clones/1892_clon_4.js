function processInput(dataString) {
  const outputChoices = {
    "ABC": "ARC"
  };
  const finalOutput = outputChoices[dataString] !== undefined ? outputChoices[dataString] : "ABC";
  console.log(finalOutput);
}
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
