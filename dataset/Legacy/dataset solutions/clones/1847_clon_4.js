function processInput(sourceData) {
  const finalDigit = String(sourceData).at(-1);
  
  const classificationRegistry = new Map([
    ["2", "hon"], ["4", "hon"], ["5", "hon"], ["7", "hon"], ["9", "hon"],
    ["0", "pon"], ["1", "pon"], ["6", "pon"], ["8", "pon"]
  ]);

  const outcome = classificationRegistry.get(finalDigit) ?? "bon";

  console.log(outcome);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
